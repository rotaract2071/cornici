#!/usr/bin/env python3

from sys import argv

width = height = 1080
frame_width = 20

def generate_frame(ratio: float) -> str:
    global width, height
    if ratio > 1:
        width = int(width * ratio)
    else:
        height = int(height / ratio)

    frame_1 = [
        f"M0,0",
        f"V{height}",
        f"H{height}",
        f"V0",
        f"Z",
        f"M{frame_width},{frame_width}",
        f"H{width - frame_width}",
        f"V{height - frame_width}",
        f"H{frame_width}",
        f"Z",
    ]
    
    frame_2 = [
        f"M{frame_width},{frame_width}",
        f"V{height - frame_width}",
        f"H{width - frame_width}",
        f"V{frame_width}",
        f"Z",
        f"M{frame_width * 2},{frame_width * 2}",
        f"H{width - frame_width * 2}",
        f"V{height - frame_width * 2}",
        f"H{frame_width * 2}",
        f"Z",
    ]
    
    frame_3 = [
        f"M{frame_width * 2},{frame_width * 2}",
        f"V{height - frame_width * 2}",
        f"H{width - frame_width * 2}",
        f"V{frame_width * 2}",
        f"Z",
        f"M{frame_width * 3},{frame_width * 3}",
        f"H{width - frame_width * 3}",
        f"V{height - frame_width * 3}",
        f"H{frame_width * 3}",
        f"Z",
    ]

    return f"""<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">""" \
           f"""<path d="{' '.join(frame_1)}" fill="red"/>""" \
           f"""<path d="{' '.join(frame_2)}" fill="white"/>""" \
           f"""<path d="{' '.join(frame_3)}" fill="purple"/>""" \
           f"""</svg>"""

ratio = eval(argv[1]) if len(argv) >= 2 else 1
print(generate_frame(ratio))