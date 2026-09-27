import os
import zipfile

def zip_dir(dir_path, zip_path, exclude_dirs=None):
    if exclude_dirs is None:
        exclude_dirs = []
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(dir_path):
            # Exclude specified directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                file_path = os.path.join(root, file)
                if file_path == zip_path:
                    continue # don't zip the zip file itself
                arcname = os.path.relpath(file_path, dir_path)
                zipf.write(file_path, arcname)

if __name__ == '__main__':
    src = r"c:\Users\Lenovo\OneDrive\Desktop\careerra\prooject\event-ai-platform"
    dst = r"c:\Users\Lenovo\OneDrive\Desktop\careerra\careera-final-project.zip"
    exclude = ['node_modules', 'venv_new', '.git', '__pycache__', '.tanstack']
    print("Zipping project...")
    zip_dir(src, dst, exclude)
    print("Done! Saved to:", dst)
