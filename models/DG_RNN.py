"""Document description
DG-RNN model
"""

# Author: Changchang Yin 
# License: MIT
# Copyright: Changchang Yin 
# Date: 11/02/2019

from flask import Flask, jsonify

class DGRNN(object):
    @classmethod
    def test(cls):
        '''
        test
        :return: json format
        '''
        return jsonify(result=1)