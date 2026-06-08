FROM deepset/hayhooks:v1.19.2

RUN pip --no-cache-dir install mcp-haystack haystack-ai==2.29.0 langfuse-haystack

CMD ["hayhooks", "run", "--host", "0.0.0.0"]
