#!/usr/bin/env sh

project_root=$(dirname $(dirname $(realpath $0)))

square=$($project_root/bin/generate_frame.py 1)
square_sum=$(echo -n "$square" | sum | cut -d' ' -f1)

echo -n $square > $project_root/public/frames/square-$square_sum.svg

landscape=$($project_root/bin/generate_frame.py 3/2)
landscape_sum=$(echo -n "$landscape" | sum | cut -d' ' -f1)

echo -n $landscape > $project_root/public/frames/landscape-$landscape_sum.svg

portrait=$($project_root/bin/generate_frame.py 2/3)
portrait_sum=$(echo -n "$portrait" | sum | cut -d' ' -f1)

echo -n $portrait > $project_root/public/frames/portrait-$portrait_sum.svg
