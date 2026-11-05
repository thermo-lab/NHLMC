import { GMTenure } from '../types/generalManager';
import { HistoricalTrade } from '../types/historicalTrade';

/**
 * Comprehensive NHL General Manager Tenure Registry (1978 - Present).
 * Covers all 32 active franchises and historical predecessors (Quebec, Hartford, Minnesota North Stars, Atlanta, etc.)
 */
export const NHL_GM_TENURES: GMTenure[] = [
  // Anaheim Ducks (Mighty Ducks of Anaheim)
  { teamAbbrev: 'ANA', teamName: 'Anaheim Ducks', startDate: '1993-03-01', endDate: '1998-03-22' }, // Jack Ferreira
  { teamAbbrev: 'ANA', teamName: 'Anaheim Ducks', startDate: '1998-03-23', endDate: '2002-04-18' }, // Pierre Gauthier
  { teamAbbrev: 'ANA', teamName: 'Anaheim Ducks', startDate: '2002-04-19', endDate: '2004-06-30' }, // Bryan Murray
  { teamAbbrev: 'ANA', teamName: 'Anaheim Ducks', startDate: '2004-07-01', endDate: '2005-06-19' }, // Al Coates (interim)
  { teamAbbrev: 'ANA', teamName: 'Anaheim Ducks', startDate: '2005-06-20', endDate: '2008-11-12' }, // Brian Burke
  { teamAbbrev: 'ANA', teamName: 'Anaheim Ducks', startDate: '2008-11-13', endDate: '2021-11-10' }, // Bob Murray
  { teamAbbrev: 'ANA', teamName: 'Anaheim Ducks', startDate: '2021-11-11', endDate: '2022-02-02' }, // Jeff Solomon (interim)
  { teamAbbrev: 'ANA', teamName: 'Anaheim Ducks', startDate: '2022-02-03', endDate: '2099-12-31' }, // Pat Verbeek

  // Arizona Coyotes / Phoenix Coyotes / Utah Hockey Club
  { teamAbbrev: 'ARI', teamName: 'Arizona Coyotes', startDate: '1996-07-01', endDate: '2000-11-19' }, // Bobby Smith
  { teamAbbrev: 'ARI', teamName: 'Arizona Coyotes', startDate: '2000-11-20', endDate: '2001-06-25' }, // Cliff Fletcher
  { teamAbbrev: 'ARI', teamName: 'Arizona Coyotes', startDate: '2001-06-26', endDate: '2007-04-10' }, // Mike Barnett
  { teamAbbrev: 'ARI', teamName: 'Arizona Coyotes', startDate: '2007-05-29', endDate: '2016-04-11' }, // Don Maloney
  { teamAbbrev: 'ARI', teamName: 'Arizona Coyotes', startDate: '2016-05-05', endDate: '2020-07-26' }, // John Chayka
  { teamAbbrev: 'ARI', teamName: 'Arizona Coyotes', startDate: '2020-07-27', endDate: '2020-09-16' }, // Steve Sullivan (interim)
  { teamAbbrev: 'ARI', teamName: 'Arizona Coyotes', startDate: '2020-09-17', endDate: '2024-04-17' }, // Bill Armstrong
  { teamAbbrev: 'UTA', teamName: 'Utah Hockey Club', startDate: '2024-04-18', endDate: '2099-12-31' }, // Bill Armstrong

  // Original Winnipeg Jets (1979 - 1996)
  { teamAbbrev: 'WPG', teamName: 'Winnipeg Jets (1979-1996)', startDate: '1978-01-01', endDate: '1988-10-23' }, // John Ferguson Sr.
  { teamAbbrev: 'WPG', teamName: 'Winnipeg Jets (1979-1996)', startDate: '1988-10-24', endDate: '1994-01-26' }, // Mike Smith
  { teamAbbrev: 'WPG', teamName: 'Winnipeg Jets (1979-1996)', startDate: '1994-01-27', endDate: '1996-06-30' }, // John Paddock

  // Boston Bruins
  { teamAbbrev: 'BOS', teamName: 'Boston Bruins', startDate: '1972-10-01', endDate: '2000-11-01' }, // Harry Sinden
  { teamAbbrev: 'BOS', teamName: 'Boston Bruins', startDate: '2000-11-02', endDate: '2006-03-25' }, // Mike O'Connell
  { teamAbbrev: 'BOS', teamName: 'Boston Bruins', startDate: '2006-03-26', endDate: '2006-07-14' }, // Jeff Gorton (interim)
  { teamAbbrev: 'BOS', teamName: 'Boston Bruins', startDate: '2006-07-15', endDate: '2015-04-15' }, // Peter Chiarelli
  { teamAbbrev: 'BOS', teamName: 'Boston Bruins', startDate: '2015-05-20', endDate: '2099-12-31' }, // Don Sweeney

  // Buffalo Sabres
  { teamAbbrev: 'BUF', teamName: 'Buffalo Sabres', startDate: '1979-06-01', endDate: '1986-11-05' }, // Scotty Bowman
  { teamAbbrev: 'BUF', teamName: 'Buffalo Sabres', startDate: '1986-11-06', endDate: '1993-08-03' }, // Gerry Meehan
  { teamAbbrev: 'BUF', teamName: 'Buffalo Sabres', startDate: '1993-08-04', endDate: '1997-06-09' }, // John Muckler
  { teamAbbrev: 'BUF', teamName: 'Buffalo Sabres', startDate: '1997-06-10', endDate: '2013-11-13' }, // Darcy Regier
  { teamAbbrev: 'BUF', teamName: 'Buffalo Sabres', startDate: '2014-01-09', endDate: '2017-04-20' }, // Tim Murray
  { teamAbbrev: 'BUF', teamName: 'Buffalo Sabres', startDate: '2017-05-11', endDate: '2020-06-16' }, // Jason Botterill
  { teamAbbrev: 'BUF', teamName: 'Buffalo Sabres', startDate: '2020-06-16', endDate: '2099-12-31' }, // Kevyn Adams

  // Calgary Flames
  { teamAbbrev: 'CGY', teamName: 'Calgary Flames', startDate: '1972-01-01', endDate: '1991-05-15' }, // Cliff Fletcher
  { teamAbbrev: 'CGY', teamName: 'Calgary Flames', startDate: '1991-05-16', endDate: '1995-11-02' }, // Doug Risebrough
  { teamAbbrev: 'CGY', teamName: 'Calgary Flames', startDate: '1995-11-03', endDate: '2000-06-05' }, // Al Coates
  { teamAbbrev: 'CGY', teamName: 'Calgary Flames', startDate: '2000-06-06', endDate: '2003-04-11' }, // Craig Button
  { teamAbbrev: 'CGY', teamName: 'Calgary Flames', startDate: '2003-04-12', endDate: '2010-12-28' }, // Darryl Sutter
  { teamAbbrev: 'CGY', teamName: 'Calgary Flames', startDate: '2010-12-28', endDate: '2013-12-12' }, // Jay Feaster
  { teamAbbrev: 'CGY', teamName: 'Calgary Flames', startDate: '2013-12-12', endDate: '2014-04-27' }, // Brian Burke (interim)
  { teamAbbrev: 'CGY', teamName: 'Calgary Flames', startDate: '2014-04-28', endDate: '2023-04-17' }, // Brad Treliving
  { teamAbbrev: 'CGY', teamName: 'Calgary Flames', startDate: '2023-05-23', endDate: '2099-12-31' }, // Craig Conroy

  // Carolina Hurricanes / Hartford Whalers
  { teamAbbrev: 'HFD', teamName: 'Hartford Whalers', startDate: '1979-01-01', endDate: '1981-05-31' }, // Jack Kelley
  { teamAbbrev: 'HFD', teamName: 'Hartford Whalers', startDate: '1981-06-01', endDate: '1982-12-15' }, // Larry Pleau
  { teamAbbrev: 'HFD', teamName: 'Hartford Whalers', startDate: '1983-02-02', endDate: '1989-05-10' }, // Emile Francis
  { teamAbbrev: 'HFD', teamName: 'Hartford Whalers', startDate: '1989-05-11', endDate: '1992-05-20' }, // Ed Johnston
  { teamAbbrev: 'HFD', teamName: 'Hartford Whalers', startDate: '1992-05-21', endDate: '1993-09-01' }, // Brian Burke
  { teamAbbrev: 'HFD', teamName: 'Hartford Whalers', startDate: '1993-09-02', endDate: '1994-06-27' }, // Paul Holmgren
  { teamAbbrev: 'HFD', teamName: 'Hartford Whalers', startDate: '1994-06-28', endDate: '1997-06-30' }, // Jim Rutherford
  { teamAbbrev: 'CAR', teamName: 'Carolina Hurricanes', startDate: '1997-07-01', endDate: '2014-04-28' }, // Jim Rutherford
  { teamAbbrev: 'CAR', teamName: 'Carolina Hurricanes', startDate: '2014-04-28', endDate: '2018-03-08' }, // Ron Francis
  { teamAbbrev: 'CAR', teamName: 'Carolina Hurricanes', startDate: '2018-05-08', endDate: '2024-05-24' }, // Don Waddell
  { teamAbbrev: 'CAR', teamName: 'Carolina Hurricanes', startDate: '2024-06-18', endDate: '2099-12-31' }, // Eric Tulsky

  // Chicago Blackhawks
  { teamAbbrev: 'CHI', teamName: 'Chicago Blackhawks', startDate: '1977-09-01', endDate: '1989-05-01' }, // Bob Pulford
  { teamAbbrev: 'CHI', teamName: 'Chicago Blackhawks', startDate: '1989-05-02', endDate: '1992-11-06' }, // Mike Keenan
  { teamAbbrev: 'CHI', teamName: 'Chicago Blackhawks', startDate: '1992-11-07', endDate: '1997-06-25' }, // Bob Pulford
  { teamAbbrev: 'CHI', teamName: 'Chicago Blackhawks', startDate: '1997-06-26', endDate: '1999-11-08' }, // Bob Murray
  { teamAbbrev: 'CHI', teamName: 'Chicago Blackhawks', startDate: '1999-11-09', endDate: '2000-10-23' }, // Bob Pulford
  { teamAbbrev: 'CHI', teamName: 'Chicago Blackhawks', startDate: '2000-10-24', endDate: '2003-10-24' }, // Mike Smith
  { teamAbbrev: 'CHI', teamName: 'Chicago Blackhawks', startDate: '2003-10-25', endDate: '2005-06-21' }, // Bob Pulford
  { teamAbbrev: 'CHI', teamName: 'Chicago Blackhawks', startDate: '2005-06-22', endDate: '2009-07-14' }, // Dale Tallon
  { teamAbbrev: 'CHI', teamName: 'Chicago Blackhawks', startDate: '2009-07-14', endDate: '2021-10-26' }, // Stan Bowman
  { teamAbbrev: 'CHI', teamName: 'Chicago Blackhawks', startDate: '2021-10-26', endDate: '2099-12-31' }, // Kyle Davidson

  // Colorado Avalanche / Quebec Nordiques
  { teamAbbrev: 'QUE', teamName: 'Quebec Nordiques', startDate: '1979-01-01', endDate: '1988-04-12' }, // Maurice Fillion
  { teamAbbrev: 'QUE', teamName: 'Quebec Nordiques', startDate: '1988-04-13', endDate: '1990-04-03' }, // Martin Madden
  { teamAbbrev: 'QUE', teamName: 'Quebec Nordiques', startDate: '1990-04-04', endDate: '1994-05-23' }, // Pierre Page
  { teamAbbrev: 'QUE', teamName: 'Quebec Nordiques', startDate: '1994-05-24', endDate: '1995-06-30' }, // Pierre Lacroix
  { teamAbbrev: 'COL', teamName: 'Colorado Avalanche', startDate: '1995-07-01', endDate: '2006-05-24' }, // Pierre Lacroix
  { teamAbbrev: 'COL', teamName: 'Colorado Avalanche', startDate: '2006-05-24', endDate: '2009-04-13' }, // Francois Giguere
  { teamAbbrev: 'COL', teamName: 'Colorado Avalanche', startDate: '2009-06-03', endDate: '2014-09-19' }, // Greg Sherman
  { teamAbbrev: 'COL', teamName: 'Colorado Avalanche', startDate: '2014-09-19', endDate: '2022-07-11' }, // Joe Sakic
  { teamAbbrev: 'COL', teamName: 'Colorado Avalanche', startDate: '2022-07-11', endDate: '2099-12-31' }, // Chris MacFarland

  // Columbus Blue Jackets
  { teamAbbrev: 'CBJ', teamName: 'Columbus Blue Jackets', startDate: '2000-01-01', endDate: '2007-02-13' }, // Doug MacLean
  { teamAbbrev: 'CBJ', teamName: 'Columbus Blue Jackets', startDate: '2007-02-13', endDate: '2013-02-12' }, // Scott Howson
  { teamAbbrev: 'CBJ', teamName: 'Columbus Blue Jackets', startDate: '2013-02-13', endDate: '2024-02-15' }, // Jarmo Kekalainen
  { teamAbbrev: 'CBJ', teamName: 'Columbus Blue Jackets', startDate: '2024-02-15', endDate: '2024-05-28' }, // John Davidson (interim)
  { teamAbbrev: 'CBJ', teamName: 'Columbus Blue Jackets', startDate: '2024-05-28', endDate: '2099-12-31' }, // Don Waddell

  // Dallas Stars / Minnesota North Stars
  { teamAbbrev: 'MNS', teamName: 'Minnesota North Stars', startDate: '1978-01-01', endDate: '1988-05-09' }, // Lou Nanne
  { teamAbbrev: 'MNS', teamName: 'Minnesota North Stars', startDate: '1988-05-10', endDate: '1990-06-05' }, // Jack Ferreira
  { teamAbbrev: 'MNS', teamName: 'Minnesota North Stars', startDate: '1990-06-06', endDate: '1992-06-09' }, // Bobby Clarke
  { teamAbbrev: 'MNS', teamName: 'Minnesota North Stars', startDate: '1992-06-10', endDate: '1993-06-30' }, // Bob Gainey
  { teamAbbrev: 'DAL', teamName: 'Dallas Stars', startDate: '1993-07-01', endDate: '2002-01-25' }, // Bob Gainey
  { teamAbbrev: 'DAL', teamName: 'Dallas Stars', startDate: '2002-01-25', endDate: '2007-11-13' }, // Doug Armstrong
  { teamAbbrev: 'DAL', teamName: 'Dallas Stars', startDate: '2007-11-13', endDate: '2009-05-31' }, // Brett Hull & Les Jackson
  { teamAbbrev: 'DAL', teamName: 'Dallas Stars', startDate: '2009-06-01', endDate: '2013-04-28' }, // Joe Nieuwendyk
  { teamAbbrev: 'DAL', teamName: 'Dallas Stars', startDate: '2013-04-29', endDate: '2099-12-31' }, // Jim Nill

  // Detroit Red Wings
  { teamAbbrev: 'DET', teamName: 'Detroit Red Wings', startDate: '1977-01-01', endDate: '1980-04-01' }, // Ted Lindsay
  { teamAbbrev: 'DET', teamName: 'Detroit Red Wings', startDate: '1980-04-02', endDate: '1982-06-02' }, // Jimmy Skinner
  { teamAbbrev: 'DET', teamName: 'Detroit Red Wings', startDate: '1982-06-03', endDate: '1990-05-18' }, // Jim Devellano
  { teamAbbrev: 'DET', teamName: 'Detroit Red Wings', startDate: '1990-05-19', endDate: '1994-06-02' }, // Bryan Murray
  { teamAbbrev: 'DET', teamName: 'Detroit Red Wings', startDate: '1994-06-03', endDate: '1997-07-17' }, // Jim Devellano
  { teamAbbrev: 'DET', teamName: 'Detroit Red Wings', startDate: '1997-07-18', endDate: '2019-04-19' }, // Ken Holland
  { teamAbbrev: 'DET', teamName: 'Detroit Red Wings', startDate: '2019-04-19', endDate: '2099-12-31' }, // Steve Yzerman

  // Edmonton Oilers
  { teamAbbrev: 'EDM', teamName: 'Edmonton Oilers', startDate: '1979-06-01', endDate: '2000-06-08' }, // Glen Sather
  { teamAbbrev: 'EDM', teamName: 'Edmonton Oilers', startDate: '2000-06-09', endDate: '2008-07-30' }, // Kevin Lowe
  { teamAbbrev: 'EDM', teamName: 'Edmonton Oilers', startDate: '2008-07-31', endDate: '2013-04-15' }, // Steve Tambellini
  { teamAbbrev: 'EDM', teamName: 'Edmonton Oilers', startDate: '2013-04-15', endDate: '2015-04-24' }, // Craig MacTavish
  { teamAbbrev: 'EDM', teamName: 'Edmonton Oilers', startDate: '2015-04-24', endDate: '2019-01-22' }, // Peter Chiarelli
  { teamAbbrev: 'EDM', teamName: 'Edmonton Oilers', startDate: '2019-01-23', endDate: '2019-05-07' }, // Keith Gretzky (interim)
  { teamAbbrev: 'EDM', teamName: 'Edmonton Oilers', startDate: '2019-05-07', endDate: '2024-06-30' }, // Ken Holland
  { teamAbbrev: 'EDM', teamName: 'Edmonton Oilers', startDate: '2024-07-24', endDate: '2099-12-31' }, // Stan Bowman

  // Florida Panthers
  { teamAbbrev: 'FLA', teamName: 'Florida Panthers', startDate: '1993-03-01', endDate: '1994-06-15' }, // Bobby Clarke
  { teamAbbrev: 'FLA', teamName: 'Florida Panthers', startDate: '1994-06-16', endDate: '2000-12-28' }, // Bryan Murray
  { teamAbbrev: 'FLA', teamName: 'Florida Panthers', startDate: '2000-12-29', endDate: '2001-12-03' }, // Bill Torrey
  { teamAbbrev: 'FLA', teamName: 'Florida Panthers', startDate: '2001-12-04', endDate: '2002-05-09' }, // Chuck Fletcher (interim)
  { teamAbbrev: 'FLA', teamName: 'Florida Panthers', startDate: '2002-05-10', endDate: '2004-05-24' }, // Rick Dudley
  { teamAbbrev: 'FLA', teamName: 'Florida Panthers', startDate: '2004-05-26', endDate: '2006-09-03' }, // Mike Keenan
  { teamAbbrev: 'FLA', teamName: 'Florida Panthers', startDate: '2006-09-03', endDate: '2009-06-01' }, // Jacques Martin
  { teamAbbrev: 'FLA', teamName: 'Florida Panthers', startDate: '2009-06-01', endDate: '2010-05-17' }, // Randy Sexton
  { teamAbbrev: 'FLA', teamName: 'Florida Panthers', startDate: '2010-05-17', endDate: '2016-05-09' }, // Dale Tallon
  { teamAbbrev: 'FLA', teamName: 'Florida Panthers', startDate: '2016-05-10', endDate: '2017-04-10' }, // Tom Rowe
  { teamAbbrev: 'FLA', teamName: 'Florida Panthers', startDate: '2017-04-10', endDate: '2020-08-10' }, // Dale Tallon
  { teamAbbrev: 'FLA', teamName: 'Florida Panthers', startDate: '2020-09-02', endDate: '2099-12-31' }, // Bill Zito

  // Los Angeles Kings
  { teamAbbrev: 'LAK', teamName: 'Los Angeles Kings', startDate: '1978-01-01', endDate: '1984-01-30' }, // George Maguire
  { teamAbbrev: 'LAK', teamName: 'Los Angeles Kings', startDate: '1984-01-31', endDate: '1992-04-20' }, // Rogie Vachon
  { teamAbbrev: 'LAK', teamName: 'Los Angeles Kings', startDate: '1992-04-21', endDate: '1994-05-16' }, // Nick Beverley
  { teamAbbrev: 'LAK', teamName: 'Los Angeles Kings', startDate: '1994-05-17', endDate: '1997-04-22' }, // Sam McMaster
  { teamAbbrev: 'LAK', teamName: 'Los Angeles Kings', startDate: '1997-04-23', endDate: '2006-04-18' }, // Dave Taylor
  { teamAbbrev: 'LAK', teamName: 'Los Angeles Kings', startDate: '2006-04-21', endDate: '2017-04-10' }, // Dean Lombardi
  { teamAbbrev: 'LAK', teamName: 'Los Angeles Kings', startDate: '2017-04-10', endDate: '2099-12-31' }, // Rob Blake

  // Minnesota Wild
  { teamAbbrev: 'MIN', teamName: 'Minnesota Wild', startDate: '1999-06-01', endDate: '2009-04-16' }, // Doug Risebrough
  { teamAbbrev: 'MIN', teamName: 'Minnesota Wild', startDate: '2009-05-21', endDate: '2018-04-23' }, // Chuck Fletcher
  { teamAbbrev: 'MIN', teamName: 'Minnesota Wild', startDate: '2018-05-21', endDate: '2019-07-30' }, // Paul Fenton
  { teamAbbrev: 'MIN', teamName: 'Minnesota Wild', startDate: '2019-08-21', endDate: '2099-12-31' }, // Bill Guerin

  // Montreal Canadiens
  { teamAbbrev: 'MTL', teamName: 'Montreal Canadiens', startDate: '1978-01-01', endDate: '1983-04-28' }, // Irving Grundman
  { teamAbbrev: 'MTL', teamName: 'Montreal Canadiens', startDate: '1983-04-28', endDate: '1995-10-21' }, // Serge Savard
  { teamAbbrev: 'MTL', teamName: 'Montreal Canadiens', startDate: '1995-10-21', endDate: '2000-11-20' }, // Rejean Houle
  { teamAbbrev: 'MTL', teamName: 'Montreal Canadiens', startDate: '2000-11-20', endDate: '2003-06-02' }, // Andre Savard
  { teamAbbrev: 'MTL', teamName: 'Montreal Canadiens', startDate: '2003-06-02', endDate: '2010-03-09' }, // Bob Gainey
  { teamAbbrev: 'MTL', teamName: 'Montreal Canadiens', startDate: '2010-03-09', endDate: '2012-03-29' }, // Pierre Gauthier
  { teamAbbrev: 'MTL', teamName: 'Montreal Canadiens', startDate: '2012-05-02', endDate: '2021-11-28' }, // Marc Bergevin
  { teamAbbrev: 'MTL', teamName: 'Montreal Canadiens', startDate: '2022-01-18', endDate: '2099-12-31' }, // Kent Hughes

  // Nashville Predators
  { teamAbbrev: 'NSH', teamName: 'Nashville Predators', startDate: '1997-07-09', endDate: '2023-06-30' }, // David Poile
  { teamAbbrev: 'NSH', teamName: 'Nashville Predators', startDate: '2023-07-01', endDate: '2099-12-31' }, // Barry Trotz

  // New Jersey Devils / Colorado Rockies
  { teamAbbrev: 'CLR', teamName: 'Colorado Rockies', startDate: '1978-01-01', endDate: '1981-05-15' }, // Ray Miron
  { teamAbbrev: 'CLR', teamName: 'Colorado Rockies', startDate: '1981-05-16', endDate: '1982-06-30' }, // Billy MacMillan
  { teamAbbrev: 'NJD', teamName: 'New Jersey Devils', startDate: '1982-07-01', endDate: '1983-11-10' }, // Billy MacMillan
  { teamAbbrev: 'NJD', teamName: 'New Jersey Devils', startDate: '1983-11-11', endDate: '1987-04-29' }, // Max McNab
  { teamAbbrev: 'NJD', teamName: 'New Jersey Devils', startDate: '1987-04-30', endDate: '2015-05-04' }, // Lou Lamoriello
  { teamAbbrev: 'NJD', teamName: 'New Jersey Devils', startDate: '2015-05-04', endDate: '2020-01-12' }, // Ray Shero
  { teamAbbrev: 'NJD', teamName: 'New Jersey Devils', startDate: '2020-01-12', endDate: '2099-12-31' }, // Tom Fitzgerald

  // New York Islanders
  { teamAbbrev: 'NYI', teamName: 'New York Islanders', startDate: '1972-01-01', endDate: '1992-08-17' }, // Bill Torrey
  { teamAbbrev: 'NYI', teamName: 'New York Islanders', startDate: '1992-08-18', endDate: '1995-12-05' }, // Don Maloney
  { teamAbbrev: 'NYI', teamName: 'New York Islanders', startDate: '1995-12-06', endDate: '2006-06-08' }, // Mike Milbury
  { teamAbbrev: 'NYI', teamName: 'New York Islanders', startDate: '2006-06-08', endDate: '2006-07-18' }, // Neil Smith
  { teamAbbrev: 'NYI', teamName: 'New York Islanders', startDate: '2006-07-18', endDate: '2018-06-05' }, // Garth Snow
  { teamAbbrev: 'NYI', teamName: 'New York Islanders', startDate: '2018-06-05', endDate: '2099-12-31' }, // Lou Lamoriello

  // New York Rangers
  { teamAbbrev: 'NYR', teamName: 'New York Rangers', startDate: '1978-01-01', endDate: '1980-11-21' }, // Fred Shero
  { teamAbbrev: 'NYR', teamName: 'New York Rangers', startDate: '1980-11-22', endDate: '1986-07-14' }, // Craig Patrick
  { teamAbbrev: 'NYR', teamName: 'New York Rangers', startDate: '1986-07-15', endDate: '1989-05-24' }, // Phil Esposito
  { teamAbbrev: 'NYR', teamName: 'New York Rangers', startDate: '1989-07-19', endDate: '2000-03-28' }, // Neil Smith
  { teamAbbrev: 'NYR', teamName: 'New York Rangers', startDate: '2000-06-01', endDate: '2015-07-01' }, // Glen Sather
  { teamAbbrev: 'NYR', teamName: 'New York Rangers', startDate: '2015-07-01', endDate: '2021-05-05' }, // Jeff Gorton
  { teamAbbrev: 'NYR', teamName: 'New York Rangers', startDate: '2021-05-05', endDate: '2099-12-31' }, // Chris Drury

  // Ottawa Senators
  { teamAbbrev: 'OTT', teamName: 'Ottawa Senators', startDate: '1991-09-01', endDate: '1993-04-15' }, // Mel Bridgman
  { teamAbbrev: 'OTT', teamName: 'Ottawa Senators', startDate: '1993-04-16', endDate: '1995-12-11' }, // Randy Sexton
  { teamAbbrev: 'OTT', teamName: 'Ottawa Senators', startDate: '1995-12-11', endDate: '1998-06-29' }, // Pierre Gauthier
  { teamAbbrev: 'OTT', teamName: 'Ottawa Senators', startDate: '1998-06-29', endDate: '1999-06-30' }, // Rick Dudley
  { teamAbbrev: 'OTT', teamName: 'Ottawa Senators', startDate: '1999-07-01', endDate: '2002-06-11' }, // Marshall Johnston
  { teamAbbrev: 'OTT', teamName: 'Ottawa Senators', startDate: '2002-06-12', endDate: '2007-05-22' }, // John Muckler
  { teamAbbrev: 'OTT', teamName: 'Ottawa Senators', startDate: '2007-05-22', endDate: '2016-04-10' }, // Bryan Murray
  { teamAbbrev: 'OTT', teamName: 'Ottawa Senators', startDate: '2016-04-10', endDate: '2023-11-01' }, // Pierre Dorion
  { teamAbbrev: 'OTT', teamName: 'Ottawa Senators', startDate: '2023-11-01', endDate: '2099-12-31' }, // Steve Staios

  // Philadelphia Flyers
  { teamAbbrev: 'PHI', teamName: 'Philadelphia Flyers', startDate: '1969-01-01', endDate: '1983-05-27' }, // Keith Allen
  { teamAbbrev: 'PHI', teamName: 'Philadelphia Flyers', startDate: '1983-05-27', endDate: '1984-05-15' }, // Bob McCammon
  { teamAbbrev: 'PHI', teamName: 'Philadelphia Flyers', startDate: '1984-05-15', endDate: '1990-04-16' }, // Bobby Clarke
  { teamAbbrev: 'PHI', teamName: 'Philadelphia Flyers', startDate: '1990-06-06', endDate: '1994-05-20' }, // Russ Farwell
  { teamAbbrev: 'PHI', teamName: 'Philadelphia Flyers', startDate: '1994-05-20', endDate: '2006-10-22' }, // Bobby Clarke
  { teamAbbrev: 'PHI', teamName: 'Philadelphia Flyers', startDate: '2006-10-22', endDate: '2014-05-07' }, // Paul Holmgren
  { teamAbbrev: 'PHI', teamName: 'Philadelphia Flyers', startDate: '2014-05-07', endDate: '2018-11-26' }, // Ron Hextall
  { teamAbbrev: 'PHI', teamName: 'Philadelphia Flyers', startDate: '2018-12-03', endDate: '2023-03-10' }, // Chuck Fletcher
  { teamAbbrev: 'PHI', teamName: 'Philadelphia Flyers', startDate: '2023-03-10', endDate: '2099-12-31' }, // Daniel Briere

  // Pittsburgh Penguins
  { teamAbbrev: 'PIT', teamName: 'Pittsburgh Penguins', startDate: '1977-01-01', endDate: '1983-05-27' }, // Baz Bastien
  { teamAbbrev: 'PIT', teamName: 'Pittsburgh Penguins', startDate: '1983-05-27', endDate: '1988-04-14' }, // Ed Johnston
  { teamAbbrev: 'PIT', teamName: 'Pittsburgh Penguins', startDate: '1988-04-14', endDate: '1989-12-05' }, // Tony Esposito
  { teamAbbrev: 'PIT', teamName: 'Pittsburgh Penguins', startDate: '1989-12-05', endDate: '2006-04-20' }, // Craig Patrick
  { teamAbbrev: 'PIT', teamName: 'Pittsburgh Penguins', startDate: '2006-05-25', endDate: '2014-05-16' }, // Ray Shero
  { teamAbbrev: 'PIT', teamName: 'Pittsburgh Penguins', startDate: '2014-06-06', endDate: '2021-01-27' }, // Jim Rutherford
  { teamAbbrev: 'PIT', teamName: 'Pittsburgh Penguins', startDate: '2021-02-09', endDate: '2023-04-14' }, // Ron Hextall
  { teamAbbrev: 'PIT', teamName: 'Pittsburgh Penguins', startDate: '2023-06-01', endDate: '2099-12-31' }, // Kyle Dubas

  // San Jose Sharks
  { teamAbbrev: 'SJS', teamName: 'San Jose Sharks', startDate: '1990-05-10', endDate: '1992-03-05' }, // Jack Ferreira
  { teamAbbrev: 'SJS', teamName: 'San Jose Sharks', startDate: '1992-03-06', endDate: '1996-03-05' }, // Chuck Grillo & Dean Lombardi
  { teamAbbrev: 'SJS', teamName: 'San Jose Sharks', startDate: '1996-03-06', endDate: '2003-03-18' }, // Dean Lombardi
  { teamAbbrev: 'SJS', teamName: 'San Jose Sharks', startDate: '2003-05-13', endDate: '2022-04-07' }, // Doug Wilson
  { teamAbbrev: 'SJS', teamName: 'San Jose Sharks', startDate: '2022-07-05', endDate: '2099-12-31' }, // Mike Grier

  // Seattle Kraken
  { teamAbbrev: 'SEA', teamName: 'Seattle Kraken', startDate: '2019-07-18', endDate: '2099-12-31' }, // Ron Francis

  // St. Louis Blues
  { teamAbbrev: 'STL', teamName: 'St. Louis Blues', startDate: '1976-01-01', endDate: '1983-05-02' }, // Emile Francis
  { teamAbbrev: 'STL', teamName: 'St. Louis Blues', startDate: '1983-05-02', endDate: '1994-06-02' }, // Ron Caron
  { teamAbbrev: 'STL', teamName: 'St. Louis Blues', startDate: '1994-06-02', endDate: '1996-12-19' }, // Mike Keenan
  { teamAbbrev: 'STL', teamName: 'St. Louis Blues', startDate: '1996-12-19', endDate: '1997-06-09' }, // Ron Caron (interim)
  { teamAbbrev: 'STL', teamName: 'St. Louis Blues', startDate: '1997-06-09', endDate: '2010-07-01' }, // Larry Pleau
  { teamAbbrev: 'STL', teamName: 'St. Louis Blues', startDate: '2010-07-01', endDate: '2099-12-31' }, // Doug Armstrong

  // Tampa Bay Lightning
  { teamAbbrev: 'TBL', teamName: 'Tampa Bay Lightning', startDate: '1991-01-01', endDate: '1998-10-13' }, // Phil Esposito
  { teamAbbrev: 'TBL', teamName: 'Tampa Bay Lightning', startDate: '1998-10-14', endDate: '1999-04-05' }, // Jacques Demers
  { teamAbbrev: 'TBL', teamName: 'Tampa Bay Lightning', startDate: '1999-06-25', endDate: '2001-04-09' }, // Rick Dudley
  { teamAbbrev: 'TBL', teamName: 'Tampa Bay Lightning', startDate: '2002-02-11', endDate: '2008-04-15' }, // Jay Feaster
  { teamAbbrev: 'TBL', teamName: 'Tampa Bay Lightning', startDate: '2008-06-25', endDate: '2010-04-12' }, // Brian Lawton
  { teamAbbrev: 'TBL', teamName: 'Tampa Bay Lightning', startDate: '2010-05-25', endDate: '2018-09-11' }, // Steve Yzerman
  { teamAbbrev: 'TBL', teamName: 'Tampa Bay Lightning', startDate: '2018-09-11', endDate: '2099-12-31' }, // Julien BriseBois

  // Toronto Maple Leafs
  { teamAbbrev: 'TOR', teamName: 'Toronto Maple Leafs', startDate: '1979-01-01', endDate: '1981-07-01' }, // Punch Imlach
  { teamAbbrev: 'TOR', teamName: 'Toronto Maple Leafs', startDate: '1981-07-02', endDate: '1988-04-07' }, // Gerry McNamara
  { teamAbbrev: 'TOR', teamName: 'Toronto Maple Leafs', startDate: '1988-04-28', endDate: '1989-03-29' }, // Gord Stellick
  { teamAbbrev: 'TOR', teamName: 'Toronto Maple Leafs', startDate: '1989-03-30', endDate: '1991-06-03' }, // Floyd Smith
  { teamAbbrev: 'TOR', teamName: 'Toronto Maple Leafs', startDate: '1991-06-03', endDate: '1997-05-13' }, // Cliff Fletcher
  { teamAbbrev: 'TOR', teamName: 'Toronto Maple Leafs', startDate: '1997-05-13', endDate: '1999-07-15' }, // Ken Dryden
  { teamAbbrev: 'TOR', teamName: 'Toronto Maple Leafs', startDate: '1999-07-15', endDate: '2003-06-26' }, // Pat Quinn
  { teamAbbrev: 'TOR', teamName: 'Toronto Maple Leafs', startDate: '2003-08-29', endDate: '2008-01-22' }, // John Ferguson Jr.
  { teamAbbrev: 'TOR', teamName: 'Toronto Maple Leafs', startDate: '2008-01-22', endDate: '2008-11-29' }, // Cliff Fletcher (interim)
  { teamAbbrev: 'TOR', teamName: 'Toronto Maple Leafs', startDate: '2008-11-29', endDate: '2013-01-09' }, // Brian Burke
  { teamAbbrev: 'TOR', teamName: 'Toronto Maple Leafs', startDate: '2013-01-09', endDate: '2015-04-12' }, // Dave Nonis
  { teamAbbrev: 'TOR', teamName: 'Toronto Maple Leafs', startDate: '2015-07-23', endDate: '2018-04-30' }, // Lou Lamoriello
  { teamAbbrev: 'TOR', teamName: 'Toronto Maple Leafs', startDate: '2018-05-11', endDate: '2023-05-19' }, // Kyle Dubas
  { teamAbbrev: 'TOR', teamName: 'Toronto Maple Leafs', startDate: '2023-05-31', endDate: '2099-12-31' }, // Brad Treliving

  // Vancouver Canucks
  { teamAbbrev: 'VAN', teamName: 'Vancouver Canucks', startDate: '1977-01-01', endDate: '1982-01-26' }, // Jake Milford
  { teamAbbrev: 'VAN', teamName: 'Vancouver Canucks', startDate: '1982-01-26', endDate: '1985-05-24' }, // Harry Neale
  { teamAbbrev: 'VAN', teamName: 'Vancouver Canucks', startDate: '1985-05-24', endDate: '1987-06-01' }, // Jack Gordon
  { teamAbbrev: 'VAN', teamName: 'Vancouver Canucks', startDate: '1987-06-01', endDate: '2000-05-01' }, // Pat Quinn
  { teamAbbrev: 'VAN', teamName: 'Vancouver Canucks', startDate: '1998-07-13', endDate: '2004-05-02' }, // Brian Burke
  { teamAbbrev: 'VAN', teamName: 'Vancouver Canucks', startDate: '2004-05-06', endDate: '2008-04-18' }, // Dave Nonis
  { teamAbbrev: 'VAN', teamName: 'Vancouver Canucks', startDate: '2008-04-23', endDate: '2014-04-08' }, // Mike Gillis
  { teamAbbrev: 'VAN', teamName: 'Vancouver Canucks', startDate: '2014-05-21', endDate: '2021-12-05' }, // Jim Benning
  { teamAbbrev: 'VAN', teamName: 'Vancouver Canucks', startDate: '2021-12-09', endDate: '2022-01-26' }, // Jim Rutherford
  { teamAbbrev: 'VAN', teamName: 'Vancouver Canucks', startDate: '2022-01-26', endDate: '2099-12-31' }, // Patrik Allvin

  // Vegas Golden Knights
  { teamAbbrev: 'VGK', teamName: 'Vegas Golden Knights', startDate: '2016-07-13', endDate: '2019-05-02' }, // George McPhee
  { teamAbbrev: 'VGK', teamName: 'Vegas Golden Knights', startDate: '2019-05-02', endDate: '2099-12-31' }, // Kelly McCrimmon

  // Washington Capitals
  { teamAbbrev: 'WSH', teamName: 'Washington Capitals', startDate: '1975-01-01', endDate: '1982-08-30' }, // Max McNab
  { teamAbbrev: 'WSH', teamName: 'Washington Capitals', startDate: '1982-08-30', endDate: '1997-06-09' }, // David Poile
  { teamAbbrev: 'WSH', teamName: 'Washington Capitals', startDate: '1997-06-09', endDate: '2014-04-26' }, // George McPhee
  { teamAbbrev: 'WSH', teamName: 'Washington Capitals', startDate: '2014-05-26', endDate: '2024-07-08' }, // Brian MacLellan
  { teamAbbrev: 'WSH', teamName: 'Washington Capitals', startDate: '2024-07-08', endDate: '2099-12-31' }, // Chris Patrick

  // Winnipeg Jets (modern) / Atlanta Thrashers
  { teamAbbrev: 'ATL', teamName: 'Atlanta Thrashers', startDate: '1998-06-23', endDate: '2010-04-14' }, // Don Waddell
  { teamAbbrev: 'ATL', teamName: 'Atlanta Thrashers', startDate: '2010-04-14', endDate: '2011-06-04' }, // Rick Dudley
  { teamAbbrev: 'WPG', teamName: 'Winnipeg Jets', startDate: '2011-06-08', endDate: '2099-12-31' }, // Kevin Cheveldayoff
];

/**
 * Maps GM tenures with their name and dates.
 */
export const GM_NAME_MAP: Record<string, string> = {
  // ANA
  'ANA:1993-03-01': 'Jack Ferreira',
  'ANA:1998-03-23': 'Pierre Gauthier',
  'ANA:2002-04-19': 'Bryan Murray',
  'ANA:2004-07-01': 'Al Coates',
  'ANA:2005-06-20': 'Brian Burke',
  'ANA:2008-11-13': 'Bob Murray',
  'ANA:2021-11-11': 'Jeff Solomon',
  'ANA:2022-02-03': 'Pat Verbeek',

  // ARI / UTA / WPG(old)
  'ARI:1996-07-01': 'Bobby Smith',
  'ARI:2000-11-20': 'Cliff Fletcher',
  'ARI:2001-06-26': 'Mike Barnett',
  'ARI:2007-05-29': 'Don Maloney',
  'ARI:2016-05-05': 'John Chayka',
  'ARI:2020-07-27': 'Steve Sullivan',
  'ARI:2020-09-17': 'Bill Armstrong',
  'UTA:2024-04-18': 'Bill Armstrong',
  'WPG:1978-01-01': 'John Ferguson Sr.',
  'WPG:1988-10-24': 'Mike Smith',
  'WPG:1994-01-27': 'John Paddock',

  // BOS
  'BOS:1972-10-01': 'Harry Sinden',
  'BOS:2000-11-02': 'Mike O\'Connell',
  'BOS:2006-03-26': 'Jeff Gorton',
  'BOS:2006-07-15': 'Peter Chiarelli',
  'BOS:2015-05-20': 'Don Sweeney',

  // BUF
  'BUF:1979-06-01': 'Scotty Bowman',
  'BUF:1986-11-06': 'Gerry Meehan',
  'BUF:1993-08-04': 'John Muckler',
  'BUF:1997-06-10': 'Darcy Regier',
  'BUF:2014-01-09': 'Tim Murray',
  'BUF:2017-05-11': 'Jason Botterill',
  'BUF:2020-06-16': 'Kevyn Adams',

  // CGY
  'CGY:1972-01-01': 'Cliff Fletcher',
  'CGY:1991-05-16': 'Doug Risebrough',
  'CGY:1995-11-03': 'Al Coates',
  'CGY:2000-06-06': 'Craig Button',
  'CGY:2003-04-12': 'Darryl Sutter',
  'CGY:2010-12-28': 'Jay Feaster',
  'CGY:2013-12-12': 'Brian Burke',
  'CGY:2014-04-28': 'Brad Treliving',
  'CGY:2023-05-23': 'Craig Conroy',

  // CAR / HFD
  'HFD:1979-01-01': 'Jack Kelley',
  'HFD:1981-06-01': 'Larry Pleau',
  'HFD:1983-02-02': 'Emile Francis',
  'HFD:1989-05-11': 'Ed Johnston',
  'HFD:1992-05-21': 'Brian Burke',
  'HFD:1993-09-02': 'Paul Holmgren',
  'HFD:1994-06-28': 'Jim Rutherford',
  'CAR:1997-07-01': 'Jim Rutherford',
  'CAR:2014-04-28': 'Ron Francis',
  'CAR:2018-05-08': 'Don Waddell',
  'CAR:2024-06-18': 'Eric Tulsky',

  // CHI
  'CHI:1977-09-01': 'Bob Pulford',
  'CHI:1989-05-02': 'Mike Keenan',
  'CHI:1992-11-07': 'Bob Pulford',
  'CHI:1997-06-26': 'Bob Murray',
  'CHI:1999-11-09': 'Bob Pulford',
  'CHI:2000-10-24': 'Mike Smith',
  'CHI:2003-10-25': 'Bob Pulford',
  'CHI:2005-06-22': 'Dale Tallon',
  'CHI:2009-07-14': 'Stan Bowman',
  'CHI:2021-10-26': 'Kyle Davidson',

  // COL / QUE
  'QUE:1979-01-01': 'Maurice Fillion',
  'QUE:1988-04-13': 'Martin Madden',
  'QUE:1990-04-04': 'Pierre Page',
  'QUE:1994-05-24': 'Pierre Lacroix',
  'COL:1995-07-01': 'Pierre Lacroix',
  'COL:2006-05-24': 'Francois Giguere',
  'COL:2009-06-03': 'Greg Sherman',
  'COL:2014-09-19': 'Joe Sakic',
  'COL:2022-07-11': 'Chris MacFarland',

  // CBJ
  'CBJ:2000-01-01': 'Doug MacLean',
  'CBJ:2007-02-13': 'Scott Howson',
  'CBJ:2013-02-13': 'Jarmo Kekalainen',
  'CBJ:2024-02-15': 'John Davidson',
  'CBJ:2024-05-28': 'Don Waddell',

  // DAL / MNS
  'MNS:1978-01-01': 'Lou Nanne',
  'MNS:1988-05-10': 'Jack Ferreira',
  'MNS:1990-06-06': 'Bobby Clarke',
  'MNS:1992-06-10': 'Bob Gainey',
  'DAL:1993-07-01': 'Bob Gainey',
  'DAL:2002-01-25': 'Doug Armstrong',
  'DAL:2007-11-13': 'Brett Hull & Les Jackson',
  'DAL:2009-06-01': 'Joe Nieuwendyk',
  'DAL:2013-04-29': 'Jim Nill',

  // DET
  'DET:1977-01-01': 'Ted Lindsay',
  'DET:1980-04-02': 'Jimmy Skinner',
  'DET:1982-06-03': 'Jim Devellano',
  'DET:1990-05-19': 'Bryan Murray',
  'DET:1994-06-03': 'Jim Devellano',
  'DET:1997-07-18': 'Ken Holland',
  'DET:2019-04-19': 'Steve Yzerman',

  // EDM
  'EDM:1979-06-01': 'Glen Sather',
  'EDM:2000-06-09': 'Kevin Lowe',
  'EDM:2008-07-31': 'Steve Tambellini',
  'EDM:2013-04-15': 'Craig MacTavish',
  'EDM:2015-04-24': 'Peter Chiarelli',
  'EDM:2019-01-23': 'Keith Gretzky',
  'EDM:2019-05-07': 'Ken Holland',
  'EDM:2024-07-24': 'Stan Bowman',

  // FLA
  'FLA:1993-03-01': 'Bobby Clarke',
  'FLA:1994-06-16': 'Bryan Murray',
  'FLA:2000-12-29': 'Bill Torrey',
  'FLA:2001-12-04': 'Chuck Fletcher',
  'FLA:2002-05-10': 'Rick Dudley',
  'FLA:2004-05-26': 'Mike Keenan',
  'FLA:2006-09-03': 'Jacques Martin',
  'FLA:2009-06-01': 'Randy Sexton',
  'FLA:2010-05-17': 'Dale Tallon',
  'FLA:2016-05-10': 'Tom Rowe',
  'FLA:2017-04-10': 'Dale Tallon',
  'FLA:2020-09-02': 'Bill Zito',

  // LAK
  'LAK:1978-01-01': 'George Maguire',
  'LAK:1984-01-31': 'Rogie Vachon',
  'LAK:1992-04-21': 'Nick Beverley',
  'LAK:1994-05-17': 'Sam McMaster',
  'LAK:1997-04-23': 'Dave Taylor',
  'LAK:2006-04-21': 'Dean Lombardi',
  'LAK:2017-04-10': 'Rob Blake',

  // MIN
  'MIN:1999-06-01': 'Doug Risebrough',
  'MIN:2009-05-21': 'Chuck Fletcher',
  'MIN:2018-05-21': 'Paul Fenton',
  'MIN:2019-08-21': 'Bill Guerin',

  // MTL
  'MTL:1978-01-01': 'Irving Grundman',
  'MTL:1983-04-28': 'Serge Savard',
  'MTL:1995-10-21': 'Rejean Houle',
  'MTL:2000-11-20': 'Andre Savard',
  'MTL:2003-06-02': 'Bob Gainey',
  'MTL:2010-03-09': 'Pierre Gauthier',
  'MTL:2012-05-02': 'Marc Bergevin',
  'MTL:2022-01-18': 'Kent Hughes',

  // NSH
  'NSH:1997-07-09': 'David Poile',
  'NSH:2023-07-01': 'Barry Trotz',

  // NJD / CLR
  'CLR:1978-01-01': 'Ray Miron',
  'CLR:1981-05-16': 'Billy MacMillan',
  'NJD:1982-07-01': 'Billy MacMillan',
  'NJD:1983-11-11': 'Max McNab',
  'NJD:1987-04-30': 'Lou Lamoriello',
  'NJD:2015-05-04': 'Ray Shero',
  'NJD:2020-01-12': 'Tom Fitzgerald',

  // NYI
  'NYI:1972-01-01': 'Bill Torrey',
  'NYI:1992-08-18': 'Don Maloney',
  'NYI:1995-12-06': 'Mike Milbury',
  'NYI:2006-06-08': 'Neil Smith',
  'NYI:2006-07-18': 'Garth Snow',
  'NYI:2018-06-05': 'Lou Lamoriello',

  // NYR
  'NYR:1978-01-01': 'Fred Shero',
  'NYR:1980-11-22': 'Craig Patrick',
  'NYR:1986-07-15': 'Phil Esposito',
  'NYR:1989-07-19': 'Neil Smith',
  'NYR:2000-06-01': 'Glen Sather',
  'NYR:2015-07-01': 'Jeff Gorton',
  'NYR:2021-05-05': 'Chris Drury',

  // OTT
  'OTT:1991-09-01': 'Mel Bridgman',
  'OTT:1993-04-16': 'Randy Sexton',
  'OTT:1995-12-11': 'Pierre Gauthier',
  'OTT:1998-06-29': 'Rick Dudley',
  'OTT:1999-07-01': 'Marshall Johnston',
  'OTT:2002-06-12': 'John Muckler',
  'OTT:2007-05-22': 'Bryan Murray',
  'OTT:2016-04-10': 'Pierre Dorion',
  'OTT:2023-11-01': 'Steve Staios',

  // PHI
  'PHI:1969-01-01': 'Keith Allen',
  'PHI:1983-05-27': 'Bob McCammon',
  'PHI:1984-05-15': 'Bobby Clarke',
  'PHI:1990-06-06': 'Russ Farwell',
  'PHI:1994-05-20': 'Bobby Clarke',
  'PHI:2006-10-22': 'Paul Holmgren',
  'PHI:2014-05-07': 'Ron Hextall',
  'PHI:2018-12-03': 'Chuck Fletcher',
  'PHI:2023-03-10': 'Daniel Briere',

  // PIT
  'PIT:1977-01-01': 'Baz Bastien',
  'PIT:1983-05-27': 'Ed Johnston',
  'PIT:1988-04-14': 'Tony Esposito',
  'PIT:1989-12-05': 'Craig Patrick',
  'PIT:2006-05-25': 'Ray Shero',
  'PIT:2014-06-06': 'Jim Rutherford',
  'PIT:2021-02-09': 'Ron Hextall',
  'PIT:2023-06-01': 'Kyle Dubas',

  // SJS
  'SJS:1990-05-10': 'Jack Ferreira',
  'SJS:1992-03-06': 'Chuck Grillo & Dean Lombardi',
  'SJS:1996-03-06': 'Dean Lombardi',
  'SJS:2003-05-13': 'Doug Wilson',
  'SJS:2022-07-05': 'Mike Grier',

  // SEA
  'SEA:2019-07-18': 'Ron Francis',

  // STL
  'STL:1976-01-01': 'Emile Francis',
  'STL:1983-05-02': 'Ron Caron',
  'STL:1994-06-02': 'Mike Keenan',
  'STL:1996-12-19': 'Ron Caron',
  'STL:1997-06-09': 'Larry Pleau',
  'STL:2010-07-01': 'Doug Armstrong',

  // TBL
  'TBL:1991-01-01': 'Phil Esposito',
  'TBL:1998-10-14': 'Jacques Demers',
  'TBL:1999-06-25': 'Rick Dudley',
  'TBL:2002-02-11': 'Jay Feaster',
  'TBL:2008-06-25': 'Brian Lawton',
  'TBL:2010-05-25': 'Steve Yzerman',
  'TBL:2018-09-11': 'Julien BriseBois',

  // TOR
  'TOR:1979-01-01': 'Punch Imlach',
  'TOR:1981-07-02': 'Gerry McNamara',
  'TOR:1988-04-28': 'Gord Stellick',
  'TOR:1989-03-30': 'Floyd Smith',
  'TOR:1991-06-03': 'Cliff Fletcher',
  'TOR:1997-05-13': 'Ken Dryden',
  'TOR:1999-07-15': 'Pat Quinn',
  'TOR:2003-08-29': 'John Ferguson Jr.',
  'TOR:2008-01-22': 'Cliff Fletcher',
  'TOR:2008-11-29': 'Brian Burke',
  'TOR:2013-01-09': 'Dave Nonis',
  'TOR:2015-07-23': 'Lou Lamoriello',
  'TOR:2018-05-11': 'Kyle Dubas',
  'TOR:2023-05-31': 'Brad Treliving',

  // VAN
  'VAN:1977-01-01': 'Jake Milford',
  'VAN:1982-01-26': 'Harry Neale',
  'VAN:1985-05-24': 'Jack Gordon',
  'VAN:1987-06-01': 'Pat Quinn',
  'VAN:1998-07-13': 'Brian Burke',
  'VAN:2004-05-06': 'Dave Nonis',
  'VAN:2008-04-23': 'Mike Gillis',
  'VAN:2014-05-21': 'Jim Benning',
  'VAN:2021-12-09': 'Jim Rutherford',
  'VAN:2022-01-26': 'Patrik Allvin',

  // VGK
  'VGK:2016-07-13': 'George McPhee',
  'VGK:2019-05-02': 'Kelly McCrimmon',

  // WSH
  'WSH:1975-01-01': 'Max McNab',
  'WSH:1982-08-30': 'David Poile',
  'WSH:1997-06-09': 'George McPhee',
  'WSH:2014-05-26': 'Brian MacLellan',
  'WSH:2024-07-08': 'Chris Patrick',

  // ATL / WPG (modern)
  'ATL:1998-06-23': 'Don Waddell',
  'ATL:2010-04-14': 'Rick Dudley',
  'WPG:2011-06-08': 'Kevin Cheveldayoff',
};

const MONTH_MAP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  january: '01', february: '02', march: '03', april: '04',
  june: '06', july: '07', august: '08', september: '09',
  october: '10', november: '11', december: '12',
};

/**
 * Normalizes any trade date string into a comparable ISO date format "YYYY-MM-DD".
 * Supports formats:
 * - "July 22, 2022" -> "2022-07-22"
 * - "Jul 22, 2022"  -> "2022-07-22"
 * - "1995-12-06"    -> "1995-12-06"
 * - "1988"          -> "1988-06-30"
 * - "1988–89"       -> "1989-01-15"
 */
export function normalizeDateToIso(dateStr: string): string {
  if (!dateStr) return '2000-01-01';

  // YYYY-MM-DD
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return dateStr;

  // "Month DD, YYYY" or "Mon DD, YYYY"
  const m1 = dateStr.match(/^([a-zA-Z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (m1) {
    const month = MONTH_MAP[m1[1].toLowerCase()] || '01';
    const day = m1[2].padStart(2, '0');
    return `${m1[3]}-${month}-${day}`;
  }

  // "YYYY–YY" season format (e.g. 1988–89)
  const seasonMatch = dateStr.match(/^(\d{4})[–-](\d{2,4})$/);
  if (seasonMatch) {
    const yr = parseInt(seasonMatch[1], 10) + 1;
    return `${yr}-01-15`;
  }

  // Plain 4-digit year
  const yearMatch = dateStr.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    return `${yearMatch[1]}-06-30`;
  }

  return '2000-01-01';
}

/**
 * Resolves the General Manager who made the trade for a given franchise on a given date.
 */
export function lookupGeneralManager(teamAbbrev: string, dateStr: string): string {
  const normTeam = (teamAbbrev || '').toUpperCase().trim();
  const isoDate = normalizeDateToIso(dateStr);

  // Filter tenures for this franchise
  const candidates = NHL_GM_TENURES.filter((t) => t.teamAbbrev === normTeam);
  if (candidates.length === 0) {
    return `${normTeam} Front Office`;
  }

  // Exact date interval check
  for (const tenure of candidates) {
    if (isoDate >= tenure.startDate && isoDate <= tenure.endDate) {
      const key = `${tenure.teamAbbrev}:${tenure.startDate}`;
      return GM_NAME_MAP[key] || `${normTeam} Front Office`;
    }
  }

  // Fallback: If date falls before first recorded tenure or after last, pick nearest
  if (isoDate < candidates[0].startDate) {
    const key = `${candidates[0].teamAbbrev}:${candidates[0].startDate}`;
    return GM_NAME_MAP[key] || `${normTeam} Front Office`;
  }

  const last = candidates[candidates.length - 1];
  const lastKey = `${last.teamAbbrev}:${last.startDate}`;
  return GM_NAME_MAP[lastKey] || `${normTeam} Front Office`;
}

/**
 * Enriches a historical trade with GM names on both Team A and Team B.
 */
export function enrichTradeWithGMs(trade: HistoricalTrade): HistoricalTrade {
  const gmA = trade.teamA.generalManager || lookupGeneralManager(trade.teamA.teamAbbrev, trade.tradeDate);
  const gmB = trade.teamB.generalManager || lookupGeneralManager(trade.teamB.teamAbbrev, trade.tradeDate);

  return {
    ...trade,
    teamA: {
      ...trade.teamA,
      generalManager: gmA,
    },
    teamB: {
      ...trade.teamB,
      generalManager: gmB,
    },
  };
}
