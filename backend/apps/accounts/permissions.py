"""Role-based permission classes for DairyTrack."""
from rest_framework import permissions

class IsAdminRole(permissions.BasePermission):
    """Allows access only to users with role=ADMIN or is_superuser."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 'ADMIN' or request.user.is_superuser


class IsRecorderOrAdmin(permissions.BasePermission):
    """
    Allows read permissions to any authenticated user,
    but write permissions only to RECORDER or ADMIN.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ['ADMIN', 'RECORDER'] or request.user.is_superuser


class IsReadOnlyOrRecorderAdmin(permissions.BasePermission):
    """
    VIEWER can read; RECORDER and ADMIN can write.
    Unauthenticated can read if public read is desired or authenticated read only.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['ADMIN', 'RECORDER'] or request.user.is_superuser
