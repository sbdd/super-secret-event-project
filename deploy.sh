#!/bin/bash

BINARYDIR=$(cd $(dirname "$0"); pwd)/bin
SOURCEDIR=$(cd $(dirname "$0"); pwd)/src

if [ ! -d $BINARYDIR ]; then
{
    mkdir $BINARYDIR
}
else
{
    rm -r $BINARYDIR/*
}
fi

xbuild $SOURCEDIR/CommandService/CommandService.fsproj /target:rebuild /property:OutDir=$BINARYDIR/;Configuration=Release;
