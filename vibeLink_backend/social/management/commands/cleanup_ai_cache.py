from django.core.management.base import BaseCommand
from django.utils import timezone
from social.models import AIRecommendationCache


class Command(BaseCommand):
    help = 'Clean up expired AI recommendation cache entries'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Get expired cache entries
        expired_entries = AIRecommendationCache.objects.filter(
            expires_at__lt=timezone.now(),
            is_valid=True
        )
        
        count = expired_entries.count()
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(f'DRY RUN: Would mark {count} expired cache entries as invalid')
            )
            for entry in expired_entries[:10]:  # Show first 10
                self.stdout.write(f'  - {entry}')
            if count > 10:
                self.stdout.write(f'  ... and {count - 10} more')
        else:
            # Mark expired entries as invalid
            updated = expired_entries.update(is_valid=False)
            self.stdout.write(
                self.style.SUCCESS(f'Successfully marked {updated} expired cache entries as invalid')
            )
        
        # Also clean up old invalid entries (older than 7 days)
        from datetime import timedelta
        
        old_invalid_entries = AIRecommendationCache.objects.filter(
            is_valid=False,
            created_at__lt=timezone.now() - timedelta(days=7)
        )
        
        old_count = old_invalid_entries.count()
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(f'DRY RUN: Would delete {old_count} old invalid cache entries')
            )
        else:
            deleted = old_invalid_entries.delete()[0]
            self.stdout.write(
                self.style.SUCCESS(f'Successfully deleted {deleted} old invalid cache entries')
            )
