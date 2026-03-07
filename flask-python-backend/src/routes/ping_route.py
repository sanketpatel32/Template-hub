from flask import Blueprint, jsonify

ping_blueprint = Blueprint('ping', __name__)


@ping_blueprint.get('/api/v1/ping')
def ping():
    return jsonify({'success': True, 'data': {'message': 'pong', 'version': 'v1'}})
