"""Views for Accounts authentication & profile."""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserSerializer, CustomTokenObtainPairSerializer, RegisterSerializer
from .permissions import IsAdminRole

class CustomTokenObtainPairView(TokenObtainPairView):
    """POST /api/auth/login/ - returns access, refresh tokens and user info."""
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    """POST /api/auth/logout/ - blacklists or invalidates refresh token."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"detail": "Logout processed."}, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    """GET /api/auth/me/ - returns authenticated user details."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserListCreateView(generics.ListCreateAPIView):
    """GET /api/auth/users/, POST /api/auth/users/ (Admin only)"""
    queryset = User.objects.all().order_by('id')
    permission_classes = [IsAdminRole]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RegisterSerializer
        return UserSerializer
