# -*- coding: utf-8 -*-
from django.db import models
from .bs_carrier import BSCarrier

class BSDevice(models.Model):
    """
    スマホ端末の基本スペック情報
    """
    name = models.CharField("機種名", max_length=100)
    brand = models.CharField("メーカー", max_length=50)
    storage_gb = models.IntegerField("容量(GB)")
    
    # 物理・耐久スペック
    weight = models.IntegerField("重量(g)", default=0)
    battery_mah = models.IntegerField("バッテリー(mAh)", default=0)
    waterproof_dustproof = models.CharField("防水防塵", max_length=20, default="IP68")
    
    # パフォーマンス (PC的スペック)
    cpu_chipset = models.CharField("SoC (CPU/GPU)", max_length=100)
    npu_performance = models.CharField("AI(NPU)性能", max_length=100, blank=True, help_text="例: 35 TOPS")
    ram_gb = models.IntegerField("メモリ(RAM)")
    
    # ディスプレイ
    display_info = models.CharField("画面 (種類/サイズ)", max_length=100)
    refresh_rate = models.IntegerField("リフレッシュレート(Hz)", default=60)
    
    # 機能
    has_nfc_felica = models.BooleanField("おサイフケータイ", default=True)
    
    # メディア
    main_image = models.URLField("代表画像URL", max_length=500, blank=True, help_text="一覧等で表示するメインの画像URL")
    
    # 価格
    sim_free_price = models.IntegerField("公式直販価格")

    class Meta:
        verbose_name = "BS端末"
        verbose_name_plural = "BS端末一覧"

    def __str__(self):
        return f"{self.brand} {self.name} ({self.storage_gb}GB)"


class BSDeviceColor(models.Model):
    """
    端末ごとのカラーバリエーションと個別画像
    """
    device = models.ForeignKey(BSDevice, on_delete=models.CASCADE, related_name='colors', verbose_name="対象端末")
    color_name = models.CharField("カラー名", max_length=50) # 例: ウルトラマリン
    color_code = models.CharField("カラーコード", max_length=7, help_text="例: #0000FF (CSS等で使用可能)", blank=True)
    image_url = models.URLField("個別画像URL", max_length=500, blank=True)

    class Meta:
        verbose_name = "BS端末カラー"
        verbose_name_plural = "BS端末カラー一覧"

    def __str__(self):
        return f"{self.device.name} - {self.color_name}"


class BSDevicePrice(models.Model):
    """
    キャリアごとの販売価格（プログラム適用価格など）
    """
    device = models.ForeignKey(BSDevice, on_delete=models.CASCADE, related_name='carrier_prices', verbose_name="端末")
    carrier = models.ForeignKey(BSCarrier, on_delete=models.CASCADE, verbose_name="キャリア")
    total_price = models.IntegerField("キャリア定価")
    program_price = models.IntegerField("2年返却時実質価格")

    class Meta:
        verbose_name = "BS端末価格設定"
        verbose_name_plural = "BS端末価格設定一覧"

    def __str__(self):
        return f"{self.carrier.name} - {self.device.name}"