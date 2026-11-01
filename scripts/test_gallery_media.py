import hashlib
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import requests

import gallery_media
import prepare_gallery_media as publication


class PublishedMediaTests(unittest.TestCase):
    def test_only_identical_verified_content_keeps_cdn_url(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(gallery_media, "ROOT", Path(directory)):
            path = Path(directory) / "gallery" / "media" / "video.mp4"
            path.parent.mkdir(parents=True)
            path.write_bytes(b"first version")
            record = dict(original_source="gallery/media/video.mp4", sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                          bytes=path.stat().st_size, verified_at_edge=True, url="https://media.datatimes.org/databites-dtcz/gallery/video-v1.mp4")
            self.assertEqual(gallery_media.published_url(path, [record]), record["url"])
            self.assertIsNone(gallery_media.published_url(path, [{**record, "verified_at_edge": False}]))
            path.write_bytes(b"newer version")
            self.assertIsNone(gallery_media.published_url(path, [record]))

    @patch.object(publication.time, "sleep")
    @patch.object(publication.upload_media, "verify")
    @patch.object(publication.upload_media, "upload")
    def test_temporary_failure_can_resume_without_overwriting(self, upload, verify, sleep):
        response = requests.Response()
        response.status_code = 503
        upload.side_effect = [requests.HTTPError(response=response), ValueError("Collision refusal: exists")]
        verify.return_value = {"verified_at_edge": True}
        result = publication.upload_or_resume("databites-dtcz/test/video-v1.mp4", b"video", "video/mp4")
        self.assertTrue(result["verified_at_edge"])
        self.assertEqual(upload.call_count, 2)
        verify.assert_called_once_with("databites-dtcz/test/video-v1.mp4", b"video", "video/mp4")
        sleep.assert_called_once()

    @patch.object(publication.upload_media, "verify", side_effect=ValueError("hash differs"))
    @patch.object(publication.upload_media, "upload", side_effect=ValueError("Collision refusal: exists"))
    def test_collision_with_different_content_fails(self, upload, verify):
        with self.assertRaisesRegex(ValueError, "hash differs"):
            publication.upload_or_resume("databites-dtcz/test/video-v1.mp4", b"video", "video/mp4")
        self.assertEqual(upload.call_count, 1)

    def test_local_path_cannot_escape_gallery_media(self):
        with self.assertRaisesRegex(ValueError, "Unexpected gallery media path"):
            publication.local_source("2026-vlaky-v-cesku", "../../.env", [])

    def test_revision_updates_existing_cdn_links_in_html(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = "assets/site-local/favicon-bites-v2.svg"
            old = "https://media.datatimes.org/databites-dtcz/site/favicon-v1.svg"
            new = old.replace("v1.svg", "v2.svg")
            pages = [root / "index.html", root / "2021-cssd-krupka-matous/index.html", root / "2026-volebni-anomalie/index.html"]
            for page in pages:
                page.parent.mkdir(parents=True, exist_ok=True)
                page.write_text(f'<link rel="icon" href="{old}">')
            with patch.object(publication, "ROOT", root), patch.object(publication, "PAGES", ()), patch.object(publication, "published_url", return_value=new):
                publication.apply_links([dict(original_source=source, url=old)], {source: "unused"})
            for page in pages:
                self.assertIn(new, page.read_text())
                self.assertNotIn(old, page.read_text())


if __name__ == "__main__":
    unittest.main()
