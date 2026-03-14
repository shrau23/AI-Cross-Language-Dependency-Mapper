import os
os.chdir('..')
os.system('git clone https://github.com/encode/starlette.git ../starlette_repo')
# Then python dependency_agent/parser.py --repo ../starlette_repo
print('Cloned Starlette (Python ASGI) for real test')

