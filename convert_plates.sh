#!/bin/bash

# Script to convert Ishihara plate PDFs to PNG with white background

cd "docs/images/plates"

# Convert each PDF to PNG with white background
for pdf in plate_*.pdf; do
    # Extract plate number
    num=$(echo $pdf | grep -o '[0-9]\+')
    
    # Convert PDF to PNG with white background, high quality (300 DPI)
    pdftoppm -png -r 300 -singlefile "$pdf" "../ishihara_plate${num}"
    
    echo "Converted $pdf to ishihara_plate${num}.png"
done

echo "Conversion complete! Created PNG files in docs/images/"
