from django.db import models


class FanzaSampleMovie(models.Model):
    """
    FANZA Preview Reality Repository

    Runtimeではない。
    評価もしない。

    FANZA Preview Reality を
    保全するための Repository。
    """

    adult_product = models.OneToOneField(
        "AdultProduct",
        on_delete=models.CASCADE,
        related_name="fanza_sample_movie",
        verbose_name="アダルト商品",
    )

    sample_movie_url = models.URLField(
        blank=True,
        default="",
        verbose_name="Sample Movie URL",
    )

    player_url = models.URLField(
        blank=True,
        default="",
        verbose_name="Player URL",
    )

    html_snapshot = models.TextField(
        blank=True,
        default="",
        verbose_name="HTML Snapshot",
    )

    player_args_json = models.JSONField(
        null=True,
        blank=True,
        verbose_name="Player Args JSON",
    )

    default_mp4_url = models.TextField(
        blank=True,
        default="",
        verbose_name="Default MP4 URL",
    )

    related_urls = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Related URLs",
    )

    fetch_status = models.CharField(
        max_length=50,
        blank=True,
        default="",
        verbose_name="Fetch Status",
    )

    last_checked_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Last Checked At",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "fanza_sample_movies"
        verbose_name = "FANZA Sample Movie"
        verbose_name_plural = "FANZA Sample Movies"

    def __str__(self):
        if self.adult_product_id:
            return (
                f"FANZA Sample Movie "
                f"#{self.adult_product_id}"
            )

        return f"FANZA Sample Movie #{self.pk}"