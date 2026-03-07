import uuid

from flask import Flask, Response, g, request

HEADER = 'x-request-id'


def register_request_id_middleware(app: Flask) -> None:
    @app.before_request
    def assign_request_id() -> None:
        incoming = request.headers.get(HEADER)
        g.request_id = incoming or str(uuid.uuid4())

    @app.after_request
    def attach_request_id(response: Response) -> Response:
        response.headers[HEADER] = g.request_id
        return response
