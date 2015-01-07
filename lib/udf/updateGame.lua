function update(topRec,username,square)
   local result = map {status = 0, message = "Ok"}

   -- STEP: check if the game is over == won
   if topRec["status"] == 'DUNZZO' then
     result['status'] = -1
     if topRec["winner"] == '' then
        result['message'] = "THIS GAME IS DUNNZO -- NO WINNER!"
      else
        result['message'] = "THIS GAME IS DUNNZO -- WINNER IS " .. topRec["winner"]
      end
     return result
   end

   -- STEP: check if it is current user's turn
   if topRec["turn"] ~= username then
     result["status"] = -1
     result["message"] = "It is " .. topRec["turn"] .. "'s turn. NOT YOURS!"
     return result
   end

   -- STEP: check if the selected square is already taken
   if topRec[square] ~= '' then
     result['status'] = -1
     result['message'] = "That square is already taken. CAN'T BE YOURS!"
     return result
   end

   -- Update Square
   topRec[square] = username

   -- Update Turn
   if topRec["turn"] == topRec["initiated"] then
     topRec['turn'] = topRec["opponent"]
   else 
     topRec['turn'] = topRec["initiated"]
   end

   -- Update game record
   aerospike:update(topRec)

   local status = ''
   local winner = ''

   -- Update status
   if topRec["TopLeft"] == topRec["TopMiddle"] and topRec["TopLeft"] == topRec["TopRight"] then
     if topRec["TopLeft"] ~= '' then
        status = "DUNZZO"
        winner = topRec["TopLeft"] -- Top Row
     end
   elseif topRec["MiddleLeft"] == topRec["MiddleMiddle"] and topRec["MiddleLeft"] == topRec["MiddleRight"] then
     if topRec["MiddleLeft"] ~= '' then
        status = "DUNZZO"
        winner = topRec["MiddleLeft"] -- Middle Row
     end
   elseif topRec["BottomLeft"] == topRec["BottomMiddle"] and topRec["BottomLeft"] == topRec["BottomRight"] then
     if topRec["BottomLeft"] ~= '' then
        status = "DUNZZO"
        winner = topRec["BottomLeft"] -- Bottom Row
     end
   elseif topRec["TopLeft"] == topRec["MiddleLeft"] and topRec["TopLeft"] == topRec["BottomLeft"] then
     if topRec["TopLeft"] ~= '' then
        status = "DUNZZO"
        winner = topRec["TopLeft"] -- Left Column
     end
   elseif topRec["TopMiddle"] == topRec["MiddleMiddle"] and topRec["TopMiddle"] == topRec["BottomMiddle"] then
     if topRec["TopMiddle"] ~= '' then
        status = "DUNZZO"
        winner = topRec["TopMiddle"] -- Middle Column
     end
   elseif topRec["TopRight"] == topRec["MiddleRight"] and topRec["TopRight"] == topRec["BottomRight"] then
     if topRec["TopRight"] ~= '' then
        status = "DUNZZO"
        winner = topRec["TopRight"] -- Right Column
     end
   elseif topRec["TopLeft"] == topRec["MiddleMiddle"] and topRec["TopLeft"] == topRec["BottomRight"] then
     if topRec["TopLeft"] ~= '' then
        status = "DUNZZO"
        winner = topRec["TopLeft"] -- Diagonal
     end
   else 
      if topRec["TopLeft"] ~= '' and topRec["TopMiddle"] ~= '' and topRec["TopRight"] ~= '' and topRec["MiddleLeft"] ~= '' and topRec["MiddleMiddle"] ~= '' and topRec["MiddleRight"] ~= '' and topRec["BottomLeft"] ~= '' and topRec["BottomMiddle"] ~= '' and topRec["BottomRight"] ~= '' then
         status = "DUNZZO" -- Tied
      end
   end

   if status ~= '' then
      topRec["status"] = status
   end
   if winner ~= '' then
      topRec["winner"] = winner
   end

   -- Update game record
   aerospike:update(topRec)

   return result
end
