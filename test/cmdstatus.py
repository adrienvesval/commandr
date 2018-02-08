import random
import time
import datetime
import os


def crash():
  x = {}
  for i in range(1000000):
    x = {1: x}
  repr(x)


rand = random.random()
if (rand > .75):
  case = 1
  casemsg = 'CASE 1 - CRASH'

if (rand > .5 and rand <= .75):
  case = 2
  casemsg = 'CASE 2 - ERROR'

if (rand <= .5):
  case = 3
  casemsg = 'CASE 3 - SUCCESS'

log = str(os.getpid()) + ' - CASE ' + casemsg + ' - ' + \
    datetime.datetime.utcnow().isoformat() + '\n'

with open('test\\cmdstatus.txt', 'a') as f:
  f.write('CRON START - ' + log)

print('CRON START - ' + log)
time.sleep(5)

if (case == 1):
  crash()

if (case == 2):
  print(a)

print('CRON END - ' + log)

with open('test\\cmdstatus.txt', 'a') as f:
  f.write('CRON END - ' + log)
