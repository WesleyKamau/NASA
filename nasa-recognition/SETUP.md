# Photo Setup Guide

This guide will help you set up the interactive group photos for your NASA recognition page.

## Quick Start

1. **Add your group photos** to `public/photos/`:
   - Place your staff group photo as `staff-group.jpg`
   - Place your interns group photo as `interns-group.jpg`

2. **Use the Setup Tool**:
   - Run the development server: `npm run dev`
   - Navigate to: `http://localhost:3000/setup`
   - Use the interactive coordinate picker to map faces

3. **Apply the coordinates**:
   - Click and drag rectangles around each person's face
   - Enter their name when prompted
   - Click "Copy JSON to Clipboard"
   - Update the corresponding person's entry in `data/people.json`

## Using the Coordinate Picker

The setup page (`/setup`) provides an interactive tool for mapping face locations:

### Step-by-Step Process

1. **Open the setup page**: Navigate to `http://localhost:3000/setup` in your browser

2. **Select the photo** you want to map (staff or interns)

3. **Draw rectangles**:
   - Click and hold at the top-left corner of a person's face
   - Drag to the bottom-right corner
   - Release the mouse

4. **Enter the person's name** when prompted (must match the name in people.json)

5. **Repeat** for all people in the photo

6. **Copy the JSON output** by clicking "Copy JSON to Clipboard"

7. **Update people.json**:
   - Open `data/people.json`
   - Find each person's entry
   - Add or update their `photoLocations` array with the data from the JSON output

## Example: Adding a Photo Location

The coordinate picker will generate JSON like this:

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
  }
]
```

You need to add the `photoLocation` object to the person's `photoLocations` array in `people.json`:

**Before:**
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

**After:**
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

## Multiple Photos

If a person appears in multiple group photos, they can have multiple entries in their `photoLocations` array:

```json
{
  "id": "john-doe",
  "name": "John Doe",
  "description": "Great teammate",
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
      "x": 45.20,
      "y": 55.80,
      "width": 7.30,
      "height": 12.50
    }
  ]
}
```

## Tips for Best Results

### Rectangle Sizing
- Include the entire head and a bit of the shoulders
- Make rectangles slightly larger rather than too small
- Ensure rectangles don't overlap significantly

### Coordinate Accuracy
- The picker outputs percentages with 2 decimal places
- These are relative to the image dimensions
- Works with any image size

### Testing
- After adding coordinates, refresh the main page
- Hover over the photo to see if highlights appear correctly
- Click to test if the modal opens with the correct person

### Common Issues

**Rectangle not appearing on main page?**
- Check that the `photoId` matches the group photo's ID in people.json
- Verify the person's category matches the photo's category

**Wrong person appearing?**
- Ensure the person's name in the coordinate picker exactly matches their name in people.json
- Check for typos or extra spaces

**Coordinates seem off?**
- The coordinates are percentage-based and scale with the image
- Re-pick the coordinates if the face area doesn't highlight correctly

## Individual Photos

For people not in group photos, you can add individual photos:

1. Add photo to `public/photos/individuals/person-name.jpg`

2. Update their entry in people.json:
```json
{
  "id": "person-name",
  "individualPhoto": "/photos/individuals/person-name.jpg",
  ...
}
```

## Troubleshooting

### Setup page won't load
- Ensure photos exist at the paths specified in `data/people.json`
- Check browser console for errors
- Verify the development server is running

### Can't draw rectangles
- Make sure you're clicking and dragging (not just clicking)
- Try a different browser if mouse events aren't registering
- Check that JavaScript is enabled

### JSON output is empty
- Ensure you've drawn at least one rectangle
- Check that you entered a name when prompted
- Verify rectangles have width and height (not just a point)

## Removing the Setup Page

Once you've configured all your photos, you may want to remove the setup page from production:

1. Delete `app/setup/page.tsx`
2. Delete `components/CoordinatePicker.tsx` (optional)

Or keep it for future updates!

## Need Help?

- Check the main README.md for general setup instructions
- Review the example data in people.json
- Test on the local development server before deploying
