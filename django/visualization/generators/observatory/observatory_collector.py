# /home/maya/shin-dev/shin-vps/django/visualization/generators/observatory/observatory_collector.py

"""
============================================================

SHIN CORE LINX
Visualization Platform
Observatory Collector

============================================================

Evidence
↓
Observation

============================================================
"""

# --------------------------------------------------
# Collect Observation
# --------------------------------------------------

def collect_observation(

    group,

    evidence_text,

):

    observation = {

        "entity": group["group_slug"],

        "universe": group["parent_group"],

        "product_count": 0,

        "total_alias": 0,

        "matched_alias": 0,

        "no_evidence": 0,

        "coverage": 0.0,

    }

    if evidence_text is None:

        return observation

    for line in evidence_text.splitlines():

        line = line.strip()

        if line.startswith("└── Count :"):

            observation["product_count"] = int(

                line.split(":")[1].strip()

            )

        elif line.startswith("├── Total Alias :"):

            observation["total_alias"] = int(

                line.split(":")[1].strip()

            )

        elif line.startswith("├── Matched Alias :"):

            observation["matched_alias"] = int(

                line.split(":")[1].strip()

            )

        elif line.startswith("├── No Evidence :"):

            observation["no_evidence"] = int(

                line.split(":")[1].strip()

            )

        elif line.startswith("└── Coverage :"):

            value = (

                line.split(":")[1]

                .replace("%", "")

                .strip()

            )

            observation["coverage"] = float(value)

    return observation


# --------------------------------------------------
# Collect Observatory
# --------------------------------------------------

def collect_observatory(

    observations,

):

    return sorted(

        observations,

        key=lambda x: (

            x["coverage"],

            x["matched_alias"],

        ),

        reverse=True,

    )