# Example: Adding Photo Coordinates

This guide shows you exactly how to add photo coordinates with real examples.

## Before: Person Without Photo Location

```json
{
  "id": "mary-hovater",
  "name": "Mary Hovater",
  "description": "Coolest office, best boss",
  "category": "staff",
  "individualPhoto": null,
  "photoLocations": []
}
```

## Step 1: Use the Coordinate Picker

1. Go to http://localhost:3000/setup
2. Find the "Staff Photo" section
3. Click and drag a rectangle around Mary's face in the photo
4. When prompted, enter "Mary Hovater"
5. Repeat for all people in the photo
6. Click "Copy JSON to Clipboard"

## Step 2: Get the Output

The coordinate picker will give you JSON like this:

```json
[
  {
    "name": "Mary Hovater",
    "photoLocation": {
      "photoId": "staff-photo",
      "x": 25.50,
      "y": 30.20,
      "width": 8.50,
      "height": 15.00
    }
  },
  {
    "name": "Gloria Caldwell",
    "photoLocation": {
      "photoId": "staff-photo",
      "x": 45.30,
      "y": 28.10,
      "width": 7.80,
      "height": 14.20
    }
  }
]
```

## Step 3: Update people.json

For **each person** in the output, find their entry in `data/people.json` and add the photoLocation to their photoLocations array.

### Mary Hovater - After:

```json
{
  "id": "mary-hovater",
  "name": "Mary Hovater",
  "description": "Coolest office, best boss",
  "category": "staff",
  "individualPhoto": null,
  "photoLocations": [
    {
      "photoId": "staff-photo",
      "x": 25.50,
      "y": 30.20,
      "width": 8.50,
      "height": 15.00
    }
  ]
}
```

### Gloria Caldwell - After:

```json
{
  "id": "gloria-caldwell",
  "name": "Gloria Caldwell",
  "description": "Best Dressed",
  "category": "staff",
  "individualPhoto": null,
  "photoLocations": [
    {
      "photoId": "staff-photo",
      "x": 45.30,
      "y": 28.10,
      "width": 7.80,
      "height": 14.20
    }
  ]
}
```

## Multiple Photos Example

If someone appears in BOTH staff and interns photos:

```json
{
  "id": "john-doe",
  "name": "John Doe",
  "description": "Great colleague",
  "category": "staff",
  "individualPhoto": null,
  "photoLocations": [
    {
      "photoId": "staff-photo",
      "x": 25.50,
      "y": 30.20,
      "width": 8.50,
      "height": 15.00
    },
    {
      "photoId": "interns-photo",
      "x": 62.40,
      "y": 45.80,
      "width": 9.20,
      "height": 16.50
    }
  ]
}
```

## Understanding the Coordinates

Each coordinate is a **percentage** of the image dimensions:

```
x: Distance from left edge (0-100%)
y: Distance from top edge (0-100%)
width: Width of the face area (0-100%)
height: Height of the face area (0-100%)
```

Example with a 1600x1000 image:
- x: 25.50% = 408 pixels from left
- y: 30.20% = 302 pixels from top
- width: 8.50% = 136 pixels wide
- height: 15.00% = 150 pixels tall

You don't need to calculate these manually - the coordinate picker does it for you!

## Full Workflow Example

### 1. Start with your data
You have 27 people in people.json with empty photoLocations arrays.

### 2. Add your group photo
Place `staff-group.jpg` in `public/photos/`

### 3. Open the setup tool
Navigate to http://localhost:3000/setup

### 4. Map faces
- Click and drag rectangles around all visible faces
- Enter each person's name when prompted
- Make sure names match exactly with people.json

### 5. Copy the output
Click "Copy JSON to Clipboard" - you'll get:

```json
[
  { "name": "Person 1", "photoLocation": {...} },
  { "name": "Person 2", "photoLocation": {...} },
  { "name": "Person 3", "photoLocation": {...} },
  ...
]
```

### 6. Update people.json
For each person in the output:
1. Find them in people.json (Ctrl+F their name)
2. Add the photoLocation to their photoLocations array
3. Save the file

### 7. Test it
1. Go to http://localhost:3000
2. Scroll to the group photo
3. Hover over faces - they should highlight
4. Click faces - modals should open with correct people

### 8. Validate
Run `npm run validate-data` to check for errors

## Common Mistakes

### ❌ Wrong: Name doesn't match
```json
// In coordinate picker: "Mary H."
// In people.json: "Mary Hovater"
// Result: You won't know which person to update!
```

### ✅ Correct: Exact name match
```json
// Both places: "Mary Hovater"
// Result: Easy to find and update!
```

### ❌ Wrong: Missing photoId
```json
{
  "photoLocations": [
    {
      "x": 25.50,
      "y": 30.20,
      "width": 8.50,
      "height": 15.00
    }
  ]
}
```

### ✅ Correct: Complete photoLocation
```json
{
  "photoLocations": [
    {
      "photoId": "staff-photo",
      "x": 25.50,
      "y": 30.20,
      "width": 8.50,
      "height": 15.00
    }
  ]
}
```

## Quick Reference

### Valid photoId values (from groupPhotos in people.json):
- `"staff-photo"` - for staff-group.jpg
- `"interns-photo"` - for interns-group.jpg

### Valid category values:
- `"staff"` - for staff members
- `"interns"` - for interns

### Coordinate ranges:
- All values must be between 0 and 100 (percentages)
- x + width should not exceed 100
- y + height should not exceed 100

## Validation

After updating people.json, run:

```bash
npm run validate-data
```

This will check for:
- Missing required fields
- Invalid photoId references
- Coordinates out of range
- Duplicate person IDs
- JSON syntax errors

## Summary

1. Use the setup tool to draw rectangles
2. Copy the JSON output
3. Paste each photoLocation into the matching person in people.json
4. Save and validate
5. View your interactive photos!

The hardest part is just making sure names match exactly. Everything else is automatic! 🚀
