from PIL import Image
import numpy as np

im = Image.open("public/images/agents/space-detail/page-canvas.jpg").convert("RGB")
arr = np.array(im)
h, w, _ = arr.shape
r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
mask = (b > 160) & (r < 80) & (g < 120) & (b > g + 40)
ys, xs = np.where(mask)
sel = (ys < h * 0.18) & (xs < w * 0.45)
ys2, xs2 = ys[sel], xs[sel]
print("hero blue", len(xs2))
if len(xs2):
    print(
        "bbox %",
        round(xs2.min() / w * 100, 2),
        round(ys2.min() / h * 100, 2),
        round(xs2.max() / w * 100, 2),
        round(ys2.max() / h * 100, 2),
    )
hero = im.crop((0, int(h * 0.10), int(w * 0.45), int(h * 0.17)))
hero = hero.resize((hero.width * 2, hero.height * 2))
hero.save(r"C:\Users\Mayn\.cursor\projects\f-new-atuofuture\assets\space-crops2\btn-zoom.png")
print("saved")
