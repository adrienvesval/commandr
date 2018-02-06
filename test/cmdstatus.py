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
  print('CASE 1 - CRASH')
  case = 1

if (rand > .5 and rand <= .75):
  print('CASE 2 - ERROR')
  case = 2

if (rand <= .5):
  print('CASE 3 - SUCCESS')
  case = 3


################## FORCE
case = 1
################## FORCE


with open('C:\\Users\\vbrajon\\100m\\command-r\\cmdstatus.txt', 'a') as f:
    f.write('CRON START - ' + str(os.getpid()) + ' - CASE ' + str(case) + ' - ' + datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc).isoformat() + '\n')

print('CRON START')
time.sleep(1)

if (case == 1):
  crash()

if (case == 2):
  print(a)

print('CRON END')

with open('C:\\Users\\vbrajon\\100m\\command-r\\cmdstatus.txt', 'a') as f:
    f.write('CRON END - ' + str(os.getpid()) + ' - CASE ' + str(case) + ' - ' + datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc).isoformat() + '\n')
