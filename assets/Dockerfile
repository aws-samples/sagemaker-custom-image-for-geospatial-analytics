ARG DISTRIBUTION_TYPE

FROM public.ecr.aws/sagemaker/sagemaker-distribution:1.8.0-$DISTRIBUTION_TYPE

ARG NB_USER="sagemaker-user"
ARG NB_UID=1000
ARG NB_GID=100

ENV MAMBA_USER=$NB_USER

USER $ROOT

ARG CPLUS_INCLUDE_PATH=/usr/include/gdal
ARG C_INCLUDE_PATH=/usr/include/gdal

RUN apt-get --allow-releaseinfo-change update -y -qq \
   && apt-get update \
   && apt install --no-install-recommends -y software-properties-common gpg-agent \
   && add-apt-repository --yes ppa:ubuntugis/ppa \
   && apt-get update \
   && apt-get install --no-install-recommends -y groff unzip libgdal-dev gdal-bin ffmpeg libsm6 libxext6 \
   && apt-get install --no-install-recommends -y --reinstall build-essential \
   && apt-get clean \
   && rm -fr /var/lib/apt/lists/*

USER $MAMBA_USER

RUN micromamba install gdal==3.6.4 --yes --channel conda-forge --name base \
   && micromamba install geopandas==0.13.2 rasterio==1.3.8 leafmap==0.31.3 rioxarray==0.15.1 --yes --channel conda-forge --name base \
   && micromamba clean -a

ENTRYPOINT ["jupyter-lab"]
CMD ["--ServerApp.ip=0.0.0.0", "--ServerApp.port=8888", "--ServerApp.allow_origin=*", "--ServerApp.token=''", "--ServerApp.base_url=/jupyterlab/default"]
