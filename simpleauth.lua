-- Pass through

linepat = '^dataset:(.-)%.%s+query:(.-)%.%s+filter:(.-)%.%s*$'

chunks = {}

for line in query:gmatch("[^\r\n]+") do
	ds, q, f = line:match(linepat)
	if ds ~= nil then 
		dataset = qmacro:dataset(ds)
		matcher = arki.matcher.new(q)
		filter = arki.matcher.new(f)
		table.insert(chunks, {dataset=dataset, matcher=matcher, filter=filter })
	else
		error("Error while parsing qmacro" .. line)
	end
end

function queryData(q, cons)
	for _, item in pairs(chunks) do
		item.dataset:queryData({matcher=item.matcher}, function(md)
			if item.filter:match(md) then
				return cons(md)
			else
				return true
			end
		end)
	end
end

function querySummary(q, sum)
	for _, item in pairs(chunks) do
		s = arki.summary.new()
		item.dataset:querySummary(item.matcher, s)
		s1 = arki.summary.new()
		s:filter(item.filter, s1)
		sum:add_summary(s1)
	end
end
