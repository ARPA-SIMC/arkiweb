from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import UniqueConstraint


class User(AbstractUser):
    """Arkiweb user."""

    class Meta(AbstractUser.Meta):
        constraints = [
            # Email addresses users must be unique.
            UniqueConstraint(
                fields=["email"],
                name="%(app_label)s_%(class)s_unique_email",
            ),
        ]
