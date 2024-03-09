import json
from xmlrpc.client import boolean

class Args():
    def __init__(self):
        self.flags = []

    def add(self, flag, value):
        self.flags.append(Flag(flag, value))
        setattr(self, flag.key, value)

    def parse(argsString):
        args = json.loads(argsString)
        
        if 'py/object' in args:
            del args['py/object']
        
        obj = Args()
        obj.__dict__ = args

        if obj.goal == 'egg':
            obj.goal = '8'

        if not hasattr(obj, 'ap_logic'):
            obj.ap_logic = False
        if not hasattr(obj, 'shuffle_small'):
            obj.shuffle_small = False
        if not hasattr(obj, 'shuffle_nightmare'):
            obj.shuffle_nightmare = False
        if not hasattr(obj, 'shuffle_maps'):
            obj.shuffle_maps = False
        if not hasattr(obj, 'shuffle_compasses'):
            obj.shuffle_compasses = False
        if not hasattr(obj, 'shuffle_beaks'):
            obj.shuffle_beaks = False

        return obj

class Flag():
    def __init__(self, ladxrArg, value):
        if isinstance(ladxrArg.default, boolean):
            self.type = 'bool'
        else:
            self.type = 'string'
        
        self.default = ladxrArg.default
        self.value = value
        self.name = ladxrArg.key
        self.choices = [x[0] for x in ladxrArg.options] if ladxrArg.options != None else None
    
    def __repr__(self) -> str:
        return f'{self.group} {self.name}={self.value}, {self.type}, {self.default}, {self.choices}'