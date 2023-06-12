import camelot
import PyPDF2

# Function to extract tables from a PDF
def extract_tables_from_pdf(file_path):
    # Open the PDF file
    with open(file_path, 'rb') as file:
        # Create a PDF reader object
        pdf_reader = PyPDF2.PdfReader(file)
        num_pages = len(pdf_reader.pages)
        print('numL: ',num_pages)
        tables = []
        num = 0
        # Iterate over each page in the PDF
        for page_number in range(num_pages):
            # Extract text from the page
            page_text = pdf_reader.pages[page_number].extract_text()

            # Use Camelot to detect and extract tables from the page
            table = camelot.read_pdf(file_path, pages=str(page_number+1))
            filename = str(num) + '.csv'
            num+=1
            table.export(filename,f='csv', compress=False)
            tables.extend(table)

        return tables

# Provide the path to your PDF file
pdf_file_path = '/home/mdsiam/Desktop/2303.01480v1.pdf'

# Extract tables from the PDF
# tables = extract_tables_from_pdf(pdf_file_path)
# print('extracted: ', extracted_tables)
#extracted_tables.export('foo.csv', f='csv', compress=True)
# Print the extracted tables
# for table in tables:
    # print(table.df, '\n\n\n\n\n\n')

# parsing_report = tables[0].parsing_report
# table_coordinates = parsing_report['tables'][0]['x1'], parsing_report['tables'][0]['top'], parsing_report['tables'][0]['x2'], parsing_report['tables'][0]['bottom']

# print(table_coordinates)
# tables = camelot.read_pdf('2303.01480v1.pdf')
# tables.export('foo.csv', f='csv', compress=True)

# parsing_report = tables[0].parsing_report
# print('parsing report: ', parsing_report)
# table_properties = parsing_report.get("table", {})
# print('table properties: ', table_properties)
# # Print the coordinates for each table
# for table_index, table in enumerate(table_properties, start=1):
#     x0, y0, x1, y1 = table['x0'], table['y0'], table['x1'], table['y1']
#     print(f"Table {table_index} coordinates: ({x0}, {y0}), ({x1}, {y1})")

# camelot.plot(tables[2], kind='contour').show()

# pdf = camelot.read_pdf('2303.01480v1.pdf')

# # Get the coordinates of the first table
# table_coordinates = pdf[0].get_table_coordinates()

# # Print the table coordinates
# print(table_coordinates)

# Read the PDF file
pdf = camelot.read_pdf('2303.01480v1.pdf')

# Get the first table
table = pdf[0]

# Get the table cells
cells = table.cells
# print(cells)
# Get the table coordinates
table_coordinates = []
for cell in cells:
    print(cell)

# Print the table coordinates
print(table_coordinates)