from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import UniqueConstraint


class User(AbstractUser):
    """Arkiweb user."""

    arkimet_restrict = models.CharField(max_length=255, blank=True, null=False)

    @property
    def skip_dataset_restrictions(self) -> bool:
        """Return True if this user is allowed access to all datasets."""
        return self.is_superuser
