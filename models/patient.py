"""Document description
GRUD for admission collection
"""

# Author: Rui Li <li.8950@osu.edu>
# License: MIT
# Copyright: Rui Li
# Date: 9/17/19

import json
from bson.objectid import ObjectId
from common.database import Database

class JSONEncoder(json.JSONEncoder):
    '''
    database object decoder, id
    https://stackoverflow.com/questions/3768895/how-to-make-a-class-json-serializable
    '''
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

class Patient(object):
    @classmethod
    def find_all_vis(cls):
        '''
        find all patient vis data, 2D vector, tsne projection results
        :return: all patient record in json format
        '''
        data = list(Database.findall("patientvis"))
        data = JSONEncoder().encode(data)
        if data is not None:
            return data

    @classmethod
    def find_all_patient(cls):
        '''
        find all patient data, provided by Changchang
        :return: all patient record in json format
        '''
        data = list(Database.findall("patient"))
        data = JSONEncoder().encode(data)
        if data is not None:
            return data
