from django.contrib import admin
from .models import Cow

@admin.register(Cow)
class CowAdmin(admin.ModelAdmin):
    list_display = ['cow_code', 'display_name', 'breed', 'status', 'joined_on']
    list_filter = ['status', 'breed']
    search_fields = ['cow_code', 'display_name', 'breed']
