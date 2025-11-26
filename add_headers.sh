#!/bin/bash

# Function to add header
add_header() {
    file="$1"
    filename=$(basename "$file")
    ext="${filename##*.}"
    
    # Skip if file doesn't exist
    if [ ! -f "$file" ]; then return; fi

    # Read first line to check if header already exists (simple check)
    first_line=$(head -n 1 "$file")
    if [[ "$first_line" == *"$filename"* ]]; then
        echo "Skipping $file (header likely exists)"
        return
    fi

    case "$ext" in
        ts|tsx|js|jsx)
            comment="// $filename"
            ;;
        css)
            comment="/* $filename */"
            ;;
        html)
            comment="<!-- $filename -->"
            ;;
        *)
            echo "Skipping $file (unsupported extension)"
            return
            ;;
    esac

    # Create temp file
    tmp_file=$(mktemp)
    echo "$comment" > "$tmp_file"
    cat "$file" >> "$tmp_file"
    mv "$tmp_file" "$file"
    echo "Updated $file"
}

export -f add_header

# Find and process files
find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" | while read -r file; do
    add_header "$file"
done

# Process root files
for file in *.ts *.js *.html *.css; do
    if [ -f "$file" ]; then
        add_header "$file"
    fi
done
