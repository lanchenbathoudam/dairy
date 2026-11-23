from django.contrib import admin
from .models import MilkCollection, MilkRecord

@admin.register(MilkCollection)
class MilkCollectionAdmin(admin.ModelAdmin):
    list_display = ['collection_date', 'session', 'status', 'recorded_at']
    list_filter = ['session', 'status', 'collection_date']

@admin.register(MilkRecord)
class MilkRecordAdmin(admin.ModelAdmin):
    list_display = ['production_date', 'session', 'cow', 'quantity_litres', 'entered_by', 'updated_at']
    list_filter = ['production_date', 'session', 'cow']
    search_fields = ['cow__cow_code', 'cow__display_name']
