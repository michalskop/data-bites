import hashlib
from pathlib import Path
import tempfile
import unittest
from unittest.mock import MagicMock, patch

import requests

import upload_media as media


class UploadTests(unittest.TestCase):
    def test_svg_preserved(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "chart.svg"
            path.write_bytes(b"<svg/>")
            self.assertEqual(media.prepare(path, "databites-dtcz/test/chart-v1.svg", "auto"),
                             ("databites-dtcz/test/chart-v1.svg", b"<svg/>", "image/svg+xml"))

    def test_conversion_and_social_card(self):
        from PIL import Image
        import io

        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "chart.png"
            Image.new("RGBA", (40, 30), (255, 0, 0, 128)).save(path)
            for mode, extension, size in (("auto", ".webp", (40, 30)), ("og-image", ".jpg", (1200, 630))):
                key, data, _ = media.prepare(path, "databites-dtcz/test/chart-v1.png", mode)
                self.assertTrue(key.endswith(extension))
                with Image.open(io.BytesIO(data)) as image:
                    self.assertEqual(image.size, size)

    def test_invalid_keys_refused(self):
        for key in ("/databites-dtcz/test/x.svg", "databites-dtcz/../x.svg", "databites-dtcz//x.svg", "other/test/x.svg", "data-bites/test/x.svg"):
            with self.subTest(key=key), self.assertRaises(ValueError):
                media.prepare(Path("missing.svg"), key, "preserve")

    @patch.object(media, "config", return_value=("key", "secret", "datatimes-media"))
    @patch.object(media.requests, "Session")
    def test_collision_and_failed_lookup_never_upload(self, session_factory, _config):
        session = session_factory.return_value.__enter__.return_value
        session.get.return_value.json.return_value = {
            "apiUrl": "https://example.test", "authorizationToken": "token",
            "allowed": {"bucketName": "datatimes-media", "bucketId": "bucket"},
        }
        for fail_lookup in (False, True):
            session.post.reset_mock()
            session.post.return_value.raise_for_status.side_effect = requests.HTTPError("lookup failed") if fail_lookup else None
            session.post.return_value.json.return_value = {"files": [{"fileName": "databites-dtcz/test/x.svg"}]}
            with self.assertRaises((ValueError, requests.HTTPError)):
                media.upload("databites-dtcz/test/x.svg", b"<svg/>", "image/svg+xml")
            self.assertEqual(session.post.call_count, 1)
            self.assertTrue(session.post.call_args.args[0].endswith("b2_list_file_names"))

    @patch.object(media.time, "sleep")
    @patch.object(media.requests, "head")
    def test_verification_rejects_bad_responses(self, head, _sleep):
        headers = {
            "Content-Length": "6", "Content-Type": "image/svg+xml",
            "Access-Control-Allow-Origin": "https://databites.datatimes.cz",
            "Cache-Control": media.CACHE_CONTROL,
            "X-Bz-Content-Sha1": hashlib.sha1(b"<svg/>").hexdigest(),
        }
        response = MagicMock(status_code=200, headers=headers)
        head.return_value = response
        self.assertTrue(media.verify("databites-dtcz/test/x.svg", b"<svg/>", "image/svg+xml")["verified_at_edge"])
        self.assertEqual(head.call_args.kwargs["headers"]["Origin"], "https://databites.datatimes.cz")
        for header in headers:
            with self.subTest(header=header):
                response.headers = {**headers, header: "invalid"}
                with self.assertRaisesRegex(ValueError, "verification failed"):
                    media.verify("databites-dtcz/test/x.svg", b"<svg/>", "image/svg+xml")
        response.headers = headers
        response.status_code = 404
        with self.assertRaisesRegex(ValueError, "verification failed"):
            media.verify("databites-dtcz/test/x.svg", b"<svg/>", "image/svg+xml")


if __name__ == "__main__":
    unittest.main()
