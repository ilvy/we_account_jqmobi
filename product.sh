rm -rf ./public-bak ./views-bak;
mv ./public-dist ./public-bak;
mv ./views-dist ./views-bak;
tar -xzvf ./source/public.tar.gz -C ./;
tar -xzvf ./source/views.tar.gz -C ./;
tar -xzvf ./source/routes.tar.gz -C ./;
## mkdir ./public-dist/images;
cp -r ./public-bak/images ./public-dist/;