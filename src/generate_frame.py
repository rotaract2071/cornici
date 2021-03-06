from sys import argv

width = height = 1080
stroke_width = 2
corner_fraction = 4
border_fraction = 18
border_width = 1080 // border_fraction
corner_side = 1080 // corner_fraction

fill_color = "#888"
stroke_color = "#444"

def generate_frame(ratio: float) -> str:
    global width, height
    if ratio > 1:
        width = int(width * ratio)
    else:
        height = int(height / ratio)

    border_1 = [
        f"M{stroke_width},{corner_side + stroke_width}",
        f"H{border_width - stroke_width}",
        f"V{height - border_width + stroke_width}",
        f"H{width - corner_side - stroke_width}",
        f"V{height - stroke_width}",
        f"H{stroke_width}",
        "Z"
    ]

    border_2 = [
        f"M{corner_side + stroke_width},{stroke_width}",
        f"H{width - stroke_width}",
        f"V{height - corner_side - stroke_width}",
        f"H{width - border_width + stroke_width}",
        f"V{border_width - stroke_width}",
        f"H{corner_side + stroke_width}",
        "Z"
    ]

    corner_1 = [
        f"M0,0",
        f"H{corner_side}",
        f"V{border_width}",
        f"S{border_width},{border_width},{border_width},{corner_side}",
        f"H0",
        "Z"
    ]

    corner_2 = [
        f"M{width},{height}",
        f"H{width - corner_side}",
        f"V{height - border_width}",
        f"S{width - border_width},{height - border_width},{width - border_width},{height - corner_side}",
        f"H{width}",
        "Z"
    ]

    return f"""<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">""" \
           f"""<path d="{' '.join(corner_1)}" fill="#fff"/>""" \
           f"""<path d="{' '.join(corner_2)}" fill="#fff"/>""" \
           f"""<path d="{' '.join(border_1)}" fill="{fill_color}" stroke="{stroke_color}" stroke-width="{stroke_width * 2}" class="border"/>""" \
           f"""<path d="{' '.join(border_2)}" fill="{fill_color}" stroke="{stroke_color}" stroke-width="{stroke_width * 2}" class="border"/>""" \
           f"""</svg>"""

ratio = eval(argv[1]) if len(argv) >= 2 else 1
print(generate_frame(ratio))