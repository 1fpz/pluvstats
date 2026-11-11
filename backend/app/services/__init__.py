"""Application services.

Routers stay thin: they validate transport data and delegate to these classes.
Services own transactions across repositories and call the pure rule engines in
`app.intelligence`.
"""
