rm -rf ./public-bak ./views-bak;
mv ./public ./public-bak;
mv ./views ./views-bak;
tar -xzvf ./source/public.tar.gz -C ./;
tar -xzvf ./source/views.tar.gz -C ./;
#tar -xzvf ./source/routes.tar.gz -C ./;
## mkdir ./public-dist/images;
mv public-dist public;
mv views-dist views;
cp -r ./public-bak/images ./public/;

