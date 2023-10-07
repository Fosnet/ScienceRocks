import mimetypes
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

from website import create_app

app = create_app() 
if __name__ == '__main__':
    app.run(debug=True)
