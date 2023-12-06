from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import tempfile
import subprocess
import json
from . import utils
import os


ALL_LANGUAGES = utils.LANGUAGES
ALL_BUILD_COMMANDS = utils.BUILD_COMMANDS


@csrf_exempt
def get_languages(request):
    if request.method == "GET":
        return JsonResponse(ALL_LANGUAGES, status=200)


@csrf_exempt
def compile_language(request):
    if request.method == "POST":
        try:
            json_data = json.loads(request.body.decode('utf-8'))
            language_code = json_data.get("language_code")
            source_code = json_data.get("source_code")
            source_input = json_data.get("source_input")
            
            if language_code not in ALL_LANGUAGES.keys():
                return HttpResponse(f"language code {language_code} not supported", status=400)
            
            if language_code:
                temp_dir = tempfile.mkdtemp()
                code_file_path = os.path.join(temp_dir, f"main.{language_code}")
                with open(code_file_path, "w") as code_file:
                    code_file.write(source_code)
                    
                if language_code == "py": 
                    build_command = ALL_BUILD_COMMANDS[language_code]
                    process = subprocess.Popen(build_command, cwd=temp_dir, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True, stdin=subprocess.PIPE)
                    stdout, stderr = process.communicate(input=source_input)
                    return JsonResponse({'result': stdout, 'error': stderr}, status=200)
                
                
                if language_code == "js":
                    process = subprocess.Popen(["node", "main.js"], cwd=temp_dir, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True) # No input in javascript
                    stdout, stderr = process.communicate()
                    return JsonResponse({'result': stdout, 'error': stderr}, status=200)
                                  
               
                                
                if language_code == "java":
                    build_command = ALL_BUILD_COMMANDS[language_code]
                    result = ""
                    error = ""

                    try:
                        subprocess.run(build_command, cwd=temp_dir, stderr=subprocess.STDOUT, check=True)

                        # Create a temporary file to store input
                        input_file_path = os.path.join(temp_dir, "input.txt")
                        with open(input_file_path, "w") as input_file:
                            input_file.write(source_input)

                        process = subprocess.Popen(["java", "main"], cwd=temp_dir, stderr=subprocess.PIPE, stdout=subprocess.PIPE, stdin=subprocess.PIPE, text=True)
                        result, error = process.communicate(input=source_input)
                        process.wait()

                    except subprocess.CalledProcessError as e:
                        error = e.stderr
                    except Exception as e:
                        error = str(e)
                    return JsonResponse({'result': result, 'error': error}, status=200)

                                
                if language_code == "cpp" or language_code == "c" or language_code == "rs":
                    build_command = ALL_BUILD_COMMANDS.get(language_code)  
                    error = ""
                    result = ""

                    try:
                        build_process = subprocess.run(build_command, cwd=temp_dir, stderr=subprocess.STDOUT, stdout=subprocess.PIPE, text=True, check=True)
                        executable_path = os.path.join(temp_dir, "main")
                        result = subprocess.check_output([executable_path], input=source_input, stderr=subprocess.STDOUT, text=True)
                    except subprocess.CalledProcessError as e:
                        error = e.stdout 
                    except Exception as e:
                        error = str(e)
                        
                    return JsonResponse({'result': result, 'error': error}, status=200)
                
                if language_code == "go":
                    result = ""
                    error = ""

                    try:
                        go_file_path = os.path.join(temp_dir, "main.go")
                        with open(go_file_path, "w") as go_file:
                            go_file.write(source_code)

                        input_file_path = os.path.join(temp_dir, "input.txt")
                        with open(input_file_path, "w") as input_file:
                            input_file.write(source_input)

                        process = subprocess.Popen(["go", "run", go_file_path], cwd=temp_dir, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True, stdin=subprocess.PIPE)
                        result, error = process.communicate(input=source_input)
                        process.wait()

                    except subprocess.CalledProcessError as e:
                        error = e.stderr
                    except Exception as e:
                        error = str(e)
                    

                    return JsonResponse({'result': result, 'error': error}, status=200)

                
            else: 
                return HttpResponse("unsupported language", status=400)        
        except Exception as e:
            return HttpResponse(f"e {e}", status=400)
        