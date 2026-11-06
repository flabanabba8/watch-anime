"""Run with Hermes's Python environment to exercise the real FastAPI router."""
import importlib.util
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

try:
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
except ImportError:
    FastAPI = None


@unittest.skipUnless(FastAPI, 'Run with Hermes runtime for the FastAPI route check')
class DashboardTests(unittest.TestCase):
    def test_route_dispatch_and_failure(self):
        path = Path(__file__).resolve().parents[1] / 'dashboard/plugin_api.py'
        spec = importlib.util.spec_from_file_location('dashboard_test', path)
        module = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = module
        spec.loader.exec_module(module)
        app = FastAPI()
        app.include_router(module.router)
        with TestClient(app) as client:
            with patch.object(module.package, 'invoke', return_value=json.dumps({'history': []})) as invoke:
                response = client.post('/action', json={'operation': 'anime_history'})
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json(), {'history': []})
                invoke.assert_called_once_with('anime_history', {})
            self.assertEqual(client.post('/action', json={'operation': 'terminal'}).status_code, 400)
            with patch.object(module.package, 'invoke', return_value=json.dumps({'error': 'Provider unavailable'})):
                self.assertEqual(client.post('/action', json={'operation': 'anime_search', 'arguments': {'query': 'test'}}).status_code, 400)
