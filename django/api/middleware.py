# -*- coding: utf-8 -*-
# django/api/middleware/domain_discovery.py

import logging

logger = logging.getLogger(__name__)


class DomainDiscoveryMiddleware:
    """
    =============================================================================
    🚀 SHIN CORE LINX｜Domain Discovery Middleware
    =============================================================================

    VPS / LOCAL / SIM 共通対応

    -------------------------------------------------------------------------
    🌐 Production Domains
    -------------------------------------------------------------------------

    bicstation.com
    api.bicstation.com
    media.bicstation.com

    bic-saving.com
    api.bic-saving.com
    media.bic-saving.com

    tiper.live
    api.tiper.live
    media.tiper.live

    avflash.xyz
    api.avflash.xyz
    media.avflash.xyz

    -------------------------------------------------------------------------
    🧪 Local Development Domains
    -------------------------------------------------------------------------

    bicstation-host
    api-bicstation-host
    ai-bicstation-host

    saving-host
    api-saving-host
    ai-saving-host

    tiper-host
    api-tiper-host
    ai-tiper-host

    avflash-host
    api-avflash-host
    ai-avflash-host

    -------------------------------------------------------------------------
    🛠 Local Path Simulation
    -------------------------------------------------------------------------

    localhost:8083/bicstation
    localhost:8083/saving
    localhost:8083/tiper
    localhost:8083/avflash

    =============================================================================
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        # ---------------------------------------------------------------------
        # Host / Path
        # ---------------------------------------------------------------------

        host = request.get_host().split(':')[0].lower()
        path = request.path_info.lower()

        # ---------------------------------------------------------------------
        # Domain Mapping
        # ---------------------------------------------------------------------

        site_configs = {

            # ==============================================================
            # 💻 BICSTATION
            # ==============================================================

            'bicstation': {

                'domains': [

                    # Production
                    'bicstation.com',
                    'api.bicstation.com',
                    'media.bicstation.com',

                    # Local
                    'bicstation-host',
                    'api-bicstation-host',
                    'ai-bicstation-host',

                    # Legacy
                    'bicstation',
                    'station',
                ],

                'paths': [
                    '/bicstation',
                ],

                'name': 'BICSTATION AI LAB',
            },

            # ==============================================================
            # 💰 BIC SAVING
            # ==============================================================

            'saving': {

                'domains': [

                    # Production
                    'bic-saving.com',
                    'api.bic-saving.com',
                    'media.bic-saving.com',

                    # Local
                    'saving-host',
                    'api-saving-host',
                    'ai-saving-host',

                    # Legacy
                    'bic-saving',
                    'saving',
                ],

                'paths': [
                    '/saving',
                ],

                'name': 'BIC SAVING',
            },

            # ==============================================================
            # 🔞 TIPER
            # ==============================================================

            'tiper': {

                'domains': [

                    # Production
                    'tiper.live',
                    'api.tiper.live',
                    'media.tiper.live',

                    # Local
                    'tiper-host',
                    'api-tiper-host',
                    'ai-tiper-host',

                    # Legacy
                    'tiper',
                ],

                'paths': [
                    '/tiper',
                ],

                'name': 'TIPER',
            },

            # ==============================================================
            # 🔥 AVFLASH
            # ==============================================================

            'avflash': {

                'domains': [

                    # Production
                    'avflash.xyz',
                    'api.avflash.xyz',
                    'media.avflash.xyz',

                    # Local
                    'avflash-host',
                    'api-avflash-host',
                    'ai-avflash-host',

                    # Legacy
                    'avflash',
                ],

                'paths': [
                    '/avflash',
                ],

                'name': 'AVFLASH',
            },
        }

        # ---------------------------------------------------------------------
        # Default
        # ---------------------------------------------------------------------

        identified_type = 'bicstation'
        identified_name = 'BICSTATION AI LAB'

        # ---------------------------------------------------------------------
        # Detection
        # ---------------------------------------------------------------------

        for site_type, config in site_configs.items():

            # -------------------------------------------------------------
            # Domain Match
            # -------------------------------------------------------------

            if any(domain in host for domain in config['domains']):

                identified_type = site_type
                identified_name = config['name']

                break

            # -------------------------------------------------------------
            # Path Match
            # -------------------------------------------------------------

            if any(path.startswith(path_prefix) for path_prefix in config['paths']):

                identified_type = site_type
                identified_name = config['name']

                break

        # ---------------------------------------------------------------------
        # Request Context
        # ---------------------------------------------------------------------

        request.site_type = identified_type
        request.site_name = identified_name

        # 🚀 Unified API Context
        request.project_id = identified_type
        request.project_name = identified_name

        # ---------------------------------------------------------------------
        # Debug Log
        # ---------------------------------------------------------------------

        logger.info(
            f"[DomainDiscovery] "
            f"host={host} "
            f"path={path} "
            f"project={identified_type}"
        )

        # ---------------------------------------------------------------------
        # Response
        # ---------------------------------------------------------------------

        response = self.get_response(request)

        return response