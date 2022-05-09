# coding=utf-8

# @Author: Kanata You 
# @Date: 2022-03-19 23:12:30 

import sys
import time
import speech_recognition as sr
import json
import os


def parse(webm, lang='en-EN'):
  r = sr.Recognizer()

  file_name = webm.replace('.webm', '.wav')

  ffmpeg = os.path.join(
    os.path.dirname(__file__),
    '..',
    '..',
    '..',
    'lib',
    'ffmpeg',
    'bin',
    'ffmpeg'
  )
  command = f"{ffmpeg} -loglevel quiet -i {webm} -ac 1 -ar 16000 {file_name} -y"
  res = os.system(command)

  if res == 1:
    raise RuntimeError('ffmpeg failed')

  with sr.AudioFile(file_name) as source:
    audio = r.record(source)

    r.adjust_for_ambient_noise(source)

    try:
      res = r.recognize_google(audio, show_all=True, language=lang)

      if type(res) is list and len(res) == 0:
        return []

      return res["alternative"]
    except sr.UnknownValueError:
      return []
    except RuntimeError as error:
      raise error

    pass

  pass


if __name__ == '__main__':
  try:
    result = parse(sys.argv[1], lang=sys.argv[2])
    print(json.dumps(result), end="")
    exit(0)
  except RuntimeError as err:
    print(json.dumps(err), end="")
    exit(1)
  pass
