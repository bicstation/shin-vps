# -*- coding: utf-8 -*-
from rest_framework import generics
from rest_framework.permissions import AllowAny
from api.models import Actress, Genre, Maker, Label, Director, Series
from api.serializers import (
    ActressSerializer, GenreSerializer, MakerSerializer, 
    LabelSerializer, DirectorSerializer, SeriesSerializer
)

class ActressListAPIView(generics.ListAPIView):
    queryset = Actress.objects.all().order_by('name')
    serializer_class = ActressSerializer
    permission_classes = [AllowAny]
    pagination_class = None

class GenreListAPIView(generics.ListAPIView):
    queryset = Genre.objects.all().order_by('name')
    serializer_class = GenreSerializer
    permission_classes = [AllowAny]
    pagination_class = None

class MakerListAPIView(generics.ListAPIView):
    queryset = Maker.objects.all().order_by('name')
    serializer_class = MakerSerializer
    permission_classes = [AllowAny]
    pagination_class = None

class LabelListAPIView(generics.ListAPIView):
    queryset = Label.objects.all().order_by('name')
    serializer_class = LabelSerializer
    permission_classes = [AllowAny]
    pagination_class = None

class DirectorListAPIView(generics.ListAPIView):
    queryset = Director.objects.all().order_by('name')
    serializer_class = DirectorSerializer
    permission_classes = [AllowAny]
    pagination_class = None

class SeriesListAPIView(generics.ListAPIView):
    queryset = Series.objects.all().order_by('name')
    serializer_class = SeriesSerializer
    permission_classes = [AllowAny]
    pagination_class = None