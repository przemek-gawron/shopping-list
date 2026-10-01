"""
Draws the app icon, the Android adaptive icon layers, the splash logo and the favicon into
assets/images. Needs Pillow (`python3 -m pip install pillow`). Run: python3 scripts/generate-icons.py

Everything is drawn at 4x and scaled down for smooth edges.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent.parent / 'assets' / 'images'
S = 4

TOP = (16, 185, 129)  # #10B981
BOTTOM = (4, 120, 87)  # #047857, the app's primary colour
DEEP = (6, 78, 59)  # #064E3B
WHITE = (255, 255, 255)
LINE = (209, 232, 222)
CHECK = (5, 150, 105)
ORANGE = (249, 115, 22)
ORANGE_DARK = (234, 88, 12)
LEAF = (34, 197, 94)
SHADOW = (2, 44, 34)


def gradient(size):
    img = Image.new('RGB', (size, size))
    d = ImageDraw.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        d.line([(0, y), (size, y)], fill=tuple(round(a + (b - a) * t) for a, b in zip(TOP, BOTTOM)))
    return img


def logo(mono=False):
    """
    The artwork alone on transparency, 1024 px: a clipboard with a checked list and a carrot.
    `mono` gives the white silhouette for Android themed icons, with the details cut out.
    """
    shadow = not mono
    clear = (0, 0, 0, 0)
    n = 1024 * S
    q = lambda v: round(v * S)
    layer = Image.new('RGBA', (n, n), (0, 0, 0, 0))

    card = (q(250), q(215), q(774), q(840))
    if shadow:
        sh = Image.new('RGBA', (n, n), (0, 0, 0, 0))
        ImageDraw.Draw(sh).rounded_rectangle((card[0], card[1] + q(22), card[2], card[3] + q(22)), q(70), fill=(*SHADOW, 110))
        layer = Image.alpha_composite(layer, sh.filter(ImageFilter.GaussianBlur(q(28))))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle(card, q(70), fill=WHITE)
    # clipboard clip
    d.rounded_rectangle((q(400), q(170), q(624), q(270)), q(40), fill=WHITE if mono else DEEP)
    d.ellipse((q(486), q(190), q(538), q(242)), fill=clear if mono else WHITE)
    if mono:
        # a gap between the clip and the card
        d.rectangle((q(400), q(258), q(624), q(270)), fill=clear)

    for i, y in enumerate([q(380), q(530), q(680)]):
        r, cx = q(42), q(345)
        if i < 2:
            d.ellipse((cx - r, y - r, cx + r, y + r), fill=clear if mono else CHECK)
            d.line([(cx - q(19), y + q(1)), (cx - q(5), y + q(16)), (cx + q(21), y - q(14))], fill=WHITE, width=q(13), joint='curve')
        else:
            d.ellipse((cx - r, y - r, cx + r, y + r), outline=clear if mono else LINE, width=q(10))
        d.rounded_rectangle((q(420), y - q(15), q(670) if i < 2 else q(560), y + q(15)), q(15), fill=clear if mono else LINE)

    # a tilted carrot over the bottom-right corner of the card
    carrot = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    c = ImageDraw.Draw(carrot)
    cx, top = q(720), q(560)
    c.polygon([(cx - q(62), top), (cx + q(62), top), (cx, top + q(330))], fill=ORANGE)
    c.ellipse((cx - q(62), top - q(30), cx + q(62), top + q(40)), fill=ORANGE)
    for yy, w in [(top + q(70), 44), (top + q(150), 30), (top + q(225), 18)]:
        c.line([(cx - q(w), yy), (cx - q(w) + q(30), yy + q(8))], fill=ORANGE_DARK, width=q(9))
    for dx, h in [(-36, 120), (0, 150), (36, 120)]:
        c.ellipse((cx + q(dx) - q(20), top - q(h), cx + q(dx) + q(20), top - q(10)), fill=LEAF)
    carrot = carrot.rotate(-28, center=(cx, top + q(120)), resample=Image.BICUBIC)
    if shadow:
        cs = Image.new('RGBA', (n, n), (0, 0, 0, 0))
        cs.paste((*SHADOW, 120), mask=carrot.split()[3])
        cs = cs.transform(cs.size, Image.AFFINE, (1, 0, 0, 0, 1, -q(14)))
        layer = Image.alpha_composite(layer, cs.filter(ImageFilter.GaussianBlur(q(16))))
    if mono:
        carrot = Image.merge('RGBA', (*Image.new('RGB', carrot.size, WHITE).split(), carrot.split()[3]))
        # cut a gap around the carrot so it stands apart from the card
        layer.paste(clear, mask=carrot.split()[3].filter(ImageFilter.GaussianBlur(q(8))).point(lambda v: 255 if v > 8 else 0))
    layer = Image.alpha_composite(layer, carrot)
    return layer.resize((1024, 1024), Image.LANCZOS)


def centred(art, scale):
    """`art` scaled to `scale` of a 1024 px transparent canvas, centred."""
    w = round(1024 * scale)
    out = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    out.alpha_composite(art.resize((w, w), Image.LANCZOS), ((1024 - w) // 2, (1024 - w) // 2))
    return out


art = logo()

# iOS (and fallback) icon: full bleed and opaque; the system rounds the corners itself
icon = gradient(1024).convert('RGBA')
icon.alpha_composite(art)
icon.convert('RGB').save(OUT / 'icon.png')

# Android adaptive icon: the launcher crops the layers, so the art stays inside the safe zone
centred(art, 0.7).save(OUT / 'android-icon-foreground.png')
gradient(1024).save(OUT / 'android-icon-background.png')
centred(logo(mono=True), 0.7).save(OUT / 'android-icon-monochrome.png')

# splash: the art alone; the background colour is set in app.json
art.save(OUT / 'splash-icon.png')

icon.convert('RGB').resize((48, 48), Image.LANCZOS).save(OUT / 'favicon.png')
