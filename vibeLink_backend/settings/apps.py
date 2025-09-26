from django.apps import AppConfig

class SettingsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'settings'

    def ready(self):
        # Register signals to react to settings changes
        import settings.signals  # noqa: F401