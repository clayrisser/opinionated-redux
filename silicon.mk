# Copyright 2020 Silicon Hills LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

PLATFORM := $(shell node -e "process.stdout.write(process.platform)")

ifeq ($(PLATFORM), win32)
	MAKE = make
	NULL := nul
	SHELL = cmd.exe
else
	NULL := /dev/null
  SHELL := $(shell bash --version >$(NULL) 2>&1 && echo bash|| echo sh)
endif

ifeq ($(CWD),)
  CWD := $(shell pwd)
endif

CD := cd
GIT := $(shell git --version >$(NULL) 2>&1 && echo git|| echo true)
NPM := $(shell pnpm --version >$(NULL) 2>&1 && echo pnpm|| (yarn --version >$(NULL) 2>&1 && echo yarn|| echo npm))
NOFAIL := 2>$(NULL)|| true

.EXPORT_ALL_VARIABLES:

DEPSLIST := node_modules/.bin/depslist

MAKE_CACHE := node_modules/.make

DONE := $(MAKE_CACHE)/done
define done
	mkdir -p $(DONE) && touch -m $(DONE)/$1
endef

define add_dep
	mkdir -p $(MAKE_CACHE)/deps && echo $2 >> $(MAKE_CACHE)/deps/$1
endef

define reset_deps
	rm $(MAKE_CACHE)/deps/$1 $(NOFAIL)
endef

define get_deps
	cat $(MAKE_CACHE)/deps/$1 $(NOFAIL)
endef

define add_cache
	mkdir -p $$(echo $1 | sed 's/\/[^\/]*$$//g') && touch -m $1
endef
