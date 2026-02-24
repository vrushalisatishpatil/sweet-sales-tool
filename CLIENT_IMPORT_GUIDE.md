# Client Import Instructions

## How to Import Clients

1. Click the **"Template"** button to download a sample CSV file
2. Open the template in Excel, Google Sheets, or any spreadsheet application
3. Fill in your client data following the format
4. Save the file as CSV
5. Click **"Import Excel"** and select your CSV file
6. The clients will be automatically added to your list

## CSV Format

The CSV file should have the following columns (in this order):

| Column | Description | Example |
|--------|-------------|---------|
| **Company** | Company name | TechVista Solutions |
| **Pincode** | Postal code | 400001 |
| **State** | State name | Maharashtra |
| **Main Area** | Primary area/city | Mumbai |
| **Multiple Areas** | Additional areas separated by semicolons (;) | Bandra;Worli |

## Important Notes

- The first row should be the header row (Company, Pincode, State, Main Area, Multiple Areas)
- Multiple areas should be separated by semicolons (;)
- The file can be saved as .csv, .txt, or .tsv
- Make sure there are no empty rows between data entries
- Special characters in company names are supported

## Example

```csv
Company,Pincode,State,Main Area,Multiple Areas
TechVista Solutions,400001,Maharashtra,Mumbai,Bandra;Worli
GreenLeaf Industries,411001,Maharashtra,Pune,Hadapsar;Viman Nagar
Metro Builders,600001,Tamil Nadu,Chennai,Velachery;T. Nagar
```

## Troubleshooting

- **Empty file error**: Make sure your CSV has at least one row of data (excluding header)
- **Data not appearing correctly**: Verify the column order matches the template
- **Multiple areas not showing**: Ensure areas are separated by semicolons (;) not commas
