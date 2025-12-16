#!/usr/bin/env python3
"""
clasp-pull.py

Iterate over all immediate subdirectories of the current working directory.
For each subdirectory containing a .clasp.json file, check if update is needed.
If needed, change into that directory and execute `clasp pull`, then fetch and save 
deployments and versions.
"""
import os
import subprocess
import sys
import json
import re
import urllib.request
import urllib.error
import time

def parse_deployments(raw_text):
    """
    Parse the output of `clasp deployments` into a list of dicts:
    [{"id": ..., "target": ..., "description": ...}, ...]
    """
    lines = raw_text.strip().splitlines()
    deployments = []
    for line in lines[1:]:  # skip header
        m = re.match(r"^-\s+(\S+)\s+@(\S+)(?:\s+-\s+(.*))?", line)
        if m:
            dep_id, target, desc = m.group(1), m.group(2), m.group(3) or ""
            deployments.append({
                "id": dep_id,
                "target": target,
                "description": desc
            })
    return deployments


def parse_versions(raw_text):
    """
    Parse the output of `clasp versions` into a list of dicts:
    [{"version": ..., "description": ...}, ...]
    """
    lines = raw_text.strip().splitlines()
    versions = []
    for line in lines[1:]:  # skip header
        m = re.match(r"^(\d+)\s*-\s*(.*)$", line)
        if m:
            ver_num, desc = m.group(1), m.group(2) or ""
            versions.append({
                "version": int(ver_num),
                "description": desc
            })
    return versions

def refresh_clasp_token():
    """Run `clasp list` to force token refresh."""
    print("Refreshing clasp token via `clasp list`...")
    try:
        subprocess.run('clasp list', shell=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        print("Warning: `clasp list` failed. Token might be invalid.", file=sys.stderr)

def get_access_token():
    """Read access token from ~/.clasprc.json"""
    rc_path = os.path.expanduser('~/.clasprc.json')
    print(f"Debug: Checking for credentials at {rc_path}")

    if not os.path.exists(rc_path):
        print(f"Debug: File {rc_path} does not exist.")
        return None

    try:
        with open(rc_path, 'r') as f:
            content = f.read()
            if not content.strip():
                print("Debug: .clasprc.json is empty.")
                return None
            data = json.loads(content)
        
        # Log top-level keys safely
        print(f"Debug: .clasprc.json top-level keys: {list(data.keys())}")

        if 'token' in data:
            token_data = data['token']
            if isinstance(token_data, dict):
                print(f"Debug: 'token' object keys: {list(token_data.keys())}")
                if 'access_token' in token_data:
                    return token_data['access_token']
                else:
                    print("Debug: 'access_token' not found inside 'token' object.")
            else:
                print(f"Debug: 'token' value is not a dict, but {type(token_data)}.")

        elif 'access_token' in data:
            print("Debug: 'access_token' found at root level.")
            return data['access_token']
        
        else:
            print("Debug: Could not find 'access_token' at root or inside 'token'.")

    except json.JSONDecodeError as e:
        print(f"Error parsing .clasprc.json: {e}", file=sys.stderr)
    except Exception as e:
        print(f"Error reading .clasprc.json: {e}", file=sys.stderr)
    return None

def get_remote_update_time(script_id, access_token):
    """Fetch updateTime from Apps Script API."""
    url = f"https://script.googleapis.com/v1/projects/{script_id}"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {access_token}")
    try:
        with urllib.request.urlopen(req) as res:
            data = json.load(res)
            return data.get('updateTime')
    except Exception as e:
        print(f"Error fetching metadata for {script_id}: {e}", file=sys.stderr)
        return None

def get_local_last_updated(project_dir):
    meta_path = os.path.join(project_dir, 'metadata.json')
    if os.path.exists(meta_path):
        try:
            with open(meta_path, 'r') as f:
                data = json.load(f)
            return data.get('lastUpdated')
        except:
            return None
    return None

def update_local_metadata(project_dir, update_time):
    meta_path = os.path.join(project_dir, 'metadata.json')
    data = {}
    if os.path.exists(meta_path):
        try:
            with open(meta_path, 'r') as f:
                data = json.load(f)
        except:
            pass
    
    data['lastUpdated'] = update_time
    
    with open(meta_path, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def run_clasp_with_retry(cmd, cwd=None, capture_output=False, retries=3):
    """
    Run a clasp command with retries.
    If it fails, try to refresh token via `clasp list` and retry.
    """
    attempt = 0
    while attempt < retries:
        attempt += 1
        print(f"  Running: {cmd} (Attempt {attempt}/{retries})")
        
        try:
            result = subprocess.run(
                cmd,
                shell=True,
                cwd=cwd,
                check=True,
                stdout=subprocess.PIPE if capture_output else None,
                stderr=subprocess.PIPE if capture_output else None,
                encoding='utf-8',
                errors='replace'
            )
            return result
        except subprocess.CalledProcessError as e:
            print(f"    Command failed with exit code {e.returncode}.", file=sys.stderr)
            if capture_output:
                print(f"    Stdout: {e.stdout}", file=sys.stderr)
                print(f"    Stderr: {e.stderr}", file=sys.stderr)
            
            # If it's an auth error, try to refresh
            # We suspect "Request is missing required authentication credential" or similar
            if attempt < retries:
                print("    Attempting to refresh token via `clasp list`...", file=sys.stderr)
                try:
                    subprocess.run('clasp list', shell=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                except:
                    pass
                time.sleep(2)  # Wait a bit
            else:
                raise e

def main():
    base_dir = os.getcwd()
    entries = os.listdir(base_dir)
    
    # Check clasp version
    try:
        subprocess.run('clasp -v', shell=True, check=True)
    except:
        print("Warning: could not check clasp version.")

    # Refresh token once at the start
    refresh_clasp_token()
    access_token = get_access_token()
    
    if not access_token:
        print("Warning: Could not get access token. Smart skipping disabled.", file=sys.stderr)

    for entry in entries:
        project_dir = os.path.join(base_dir, entry)
        clasp_config = os.path.join(project_dir, '.clasp.json')

        if os.path.isdir(project_dir) and os.path.isfile(clasp_config):
            print(f"Processing project '{entry}'...")
            
            should_pull = True
            script_id = None
            remote_update_time = None
            
            if access_token:
                try:
                    with open(clasp_config, 'r') as f:
                        cfg = json.load(f)
                        script_id = cfg.get('scriptId')
                except:
                    pass
                
                if script_id:
                    remote_update_time = get_remote_update_time(script_id, access_token)
                    local_last_updated = get_local_last_updated(project_dir)
                    
                    if remote_update_time and local_last_updated:
                        if remote_update_time <= local_last_updated:
                             print(f"  Skipping pull: Remote ({remote_update_time}) <= Local ({local_last_updated})")
                             should_pull = False
                        else:
                             print(f"  Update needed: Remote ({remote_update_time}) > Local ({local_last_updated})")
                    elif not remote_update_time:
                         print("  Pulling: Could not fetch remote metadata.")
                    elif not local_last_updated:
                         print("  Pulling: No local metadata.")

            if should_pull:
                try:
                    # 1) Pull latest files via shell
                    print("  Running `clasp pull` via shell...")
                    run_clasp_with_retry('clasp pull', cwd=project_dir)

                    # 2) Fetch deployments via shell
                    print("  Fetching deployments via shell...")
                    proc_dep = run_clasp_with_retry(
                        'clasp deployments',
                        cwd=project_dir,
                        capture_output=True
                    )
                    raw_dep = proc_dep.stdout
                    with open(os.path.join(project_dir, 'deployments.txt'), 'w', encoding='utf-8') as f:
                        f.write(raw_dep)
                    deps = parse_deployments(raw_dep)
                    with open(os.path.join(project_dir, 'deployments.json'), 'w', encoding='utf-8') as f:
                        json.dump(deps, f, ensure_ascii=False, indent=2)

                    # 3) Fetch versions via shell
                    print("  Fetching versions via shell...")
                    proc_ver = run_clasp_with_retry(
                        'clasp versions',
                        cwd=project_dir,
                        capture_output=True
                    )
                    raw_ver = proc_ver.stdout
                    with open(os.path.join(project_dir, 'versions.txt'), 'w', encoding='utf-8') as f:
                        f.write(raw_ver)
                    vers = parse_versions(raw_ver)
                    with open(os.path.join(project_dir, 'versions.json'), 'w', encoding='utf-8') as f:
                        json.dump(vers, f, ensure_ascii=False, indent=2)
                    
                    # Update metadata if we have the time
                    if remote_update_time:
                        update_local_metadata(project_dir, remote_update_time)

                    print(f"  Completed project '{entry}'.")

                except subprocess.CalledProcessError as e:
                    print(f"Error: command failed in {entry}: {e}", file=sys.stderr)
                finally:
                    pass  # We used cwd argument, so we don't need to chdir back

    print("All projects processed.")


if __name__ == '__main__':
    main()