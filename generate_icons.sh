#!/bin/bash

# Source logo
SRC="/Users/arsh/.gemini/antigravity/brain/5bf78358-3c24-46b1-8be3-7a20b97f52d8/pennywise_logo_1773684883195.png"
RES_DIR="/Users/arsh/Desktop/work/portfolio/Expense-BUilder/download (12)/android/app/src/main/res"

if [ ! -f "$SRC" ]; then
    echo "Source icon not found at $SRC"
    exit 1
fi

sizes="48 72 96 144 192"
dirs="mipmap-mdpi mipmap-hdpi mipmap-xhdpi mipmap-xxhdpi mipmap-xxxhdpi"

size_array=($sizes)
dir_array=($dirs)

for i in "${!dir_array[@]}"; do
    dir="${dir_array[$i]}"
    size="${size_array[$i]}"
    
    mkdir -p "$RES_DIR/$dir"
    
    # Square icon
    sips -z $size $size "$SRC" --out "$RES_DIR/$dir/ic_launcher.png"
    
    # Round icon 
    sips -z $size $size "$SRC" --out "$RES_DIR/$dir/ic_launcher_round.png"
done

# Splash screen (maybe 1024x1024, or standard splash drawable)
mkdir -p "$RES_DIR/drawable"
mkdir -p "$RES_DIR/drawable-port-mdpi"
mkdir -p "$RES_DIR/drawable-port-hdpi"
mkdir -p "$RES_DIR/drawable-port-xhdpi"
mkdir -p "$RES_DIR/drawable-port-xxhdpi"
mkdir -p "$RES_DIR/drawable-port-xxxhdpi"

sips -z 1024 1024 "$SRC" --out "$RES_DIR/drawable/splash.png"
sips -z 1024 1024 "$SRC" --out "$RES_DIR/drawable-port-mdpi/splash.png"
sips -z 1024 1024 "$SRC" --out "$RES_DIR/drawable-port-hdpi/splash.png"
sips -z 1024 1024 "$SRC" --out "$RES_DIR/drawable-port-xhdpi/splash.png"
sips -z 1024 1024 "$SRC" --out "$RES_DIR/drawable-port-xxhdpi/splash.png"
sips -z 1024 1024 "$SRC" --out "$RES_DIR/drawable-port-xxxhdpi/splash.png"

echo "Android icons generated!"
