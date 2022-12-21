import os
import re
import json

tournaments = ["OWC", "TWC", "CWC", "MWC"]

wiki_repo_url = "https://github.com/ppy/osu-wiki"
wiki_local_dir = "osu-wiki"
wiki_tournaments_dir = "wiki/Tournaments"

if os.path.exists(wiki_local_dir):
    print("-- pulling")
    os.system(" && ".join([
        f"cd {wiki_local_dir}",
        "git pull origin master",
        "cd .."
    ]))
else:
    # only fetch the relevant tournaments directory instead of everything else as well, to save space and bandwidth
    print("-- fetching osu wiki tournaments")
    wiki_tournament_dirs = [wiki_tournaments_dir + "/" + t for t in tournaments]
    os.system(" && ".join([
        f"git clone --depth 1 --filter=blob:none --sparse {wiki_repo_url} {wiki_local_dir}",
        f"cd {wiki_local_dir}",
        f"git sparse-checkout set {' '.join(wiki_tournament_dirs)}",
        "cd .."
    ]))

print("finished fetching wiki data")

mapset_id_re = re.compile(r"https://osu.ppy.sh/beatmapsets/(\d+)")

badges = []

# every iteration in the tournament series has its own directory
tournament_dir = os.path.join(wiki_local_dir, wiki_tournaments_dir)
for tournament in os.listdir(tournament_dir):
    tour_path = os.path.join(tournament_dir, tournament)

    for edition in os.listdir(tour_path):
        edition_path = os.path.join(tour_path, edition)
        if not os.path.isdir(edition_path):
            continue

        md_path = os.path.join(edition_path, "en.md")
        with open(md_path, mode="r", encoding="utf-8") as md:
            content = md.read()

        mapset_ids = [int(x) for x in mapset_id_re.findall(content)]
        print(f"---- found {len(mapset_ids)} maps in {tournament} {edition}")

        badges.append({
            "name": f"{tournament} {edition.replace('_', ' ')}",
            "color": "#DE49A1",
            "slot": "title",
            "mapsets": mapset_ids
        })

with open("world_cup_maps.json", "w+", encoding="utf-8") as j:
    json.dump(badges, j, indent="\t")

print("-- wrote output to file")
