from django.db import models

class BSCarrier(models.Model):
    name = models.CharField("ブランド名", max_length=50, unique=True)
    parent_company = models.CharField("親キャリア", max_length=20)
    is_mvno = models.BooleanField("MVNOか", default=False)

    class Meta:
        verbose_name = "BSキャリア"
        verbose_name_plural = "BSキャリア一覧"

    def __str__(self):
        return self.name