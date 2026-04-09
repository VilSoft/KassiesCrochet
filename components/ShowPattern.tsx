import { pattern } from '@/interfaces'
import React, { useState } from 'react'
import style from '@/styles/Pattern.module.css'
import Image from 'next/image'
import { PencilLine } from 'lucide-react'
import { Button } from './ui/button'
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from './ui/select'
import ModifyPatternForm from './ModifyPatternForm'

interface PatternProp {
    pattern: pattern
}

function ShowPattern({ pattern } : PatternProp) {

  const [modMode, setModMode] = useState<boolean>(false);
  const [patternHere, setPattern] = useState<pattern>(pattern);

  const handleModify = () => {
    setModMode(true);
  }

  if (modMode) {
    return (
      <ModifyPatternForm pattern={patternHere} setModMode={setModMode} setPattern={setPattern} />
    )
  } else {
    return (
        <div>
            <br />
            {/* <div className="relative">
              {patternHere.image !== "" && <Image width={0} height={0} sizes='100vh' src={`/api/uploads/${patternHere.image}`} alt={patternHere.image} className={style.image} />}
            </div> */}
            <br />
            <div className="flex justify-start items-start">
              <Button variant="outline" className="ml-auto" onClick={handleModify}>
                <PencilLine />
              </Button>
            </div><br />
            <h1>Supplies:</h1>
            {patternHere.supplies.map((i) => (
                <p key={i.name}>{i.name}</p>
            ))}
            <br />
            <h1>Steps:</h1>
            {patternHere.instructions.map((i, j) => (
                <p key={j} className="mb-2">{j + 1}: {i}</p>
            ))}
        </div>
    )
  }
}

export default ShowPattern