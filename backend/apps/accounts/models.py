from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Farm Administrator'
        RECORDER = 'RECORDER', 'Milking Recorder'
        VIEWER = 'VIEWER', 'Read-Only Viewer'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.RECORDER,
        help_text="Determines authorization tier in DairyTrack",
    )

    def is_admin(self) -> bool:
        return self.role == self.Role.ADMIN or self.is_superuser

    def is_recorder(self) -> bool:
        return self.role in [self.Role.ADMIN, self.Role.RECORDER] or self.is_superuser

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
